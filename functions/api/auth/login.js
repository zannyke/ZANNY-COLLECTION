export async function onRequestPost(context) {
  try {
    const data = await context.request.json();
    const email = (data.email || '').trim().toLowerCase();

    if (!email) {
      return Response.json({ success: false, message: 'Email is required' }, { status: 400 });
    }

    const db = context.env.DB;
    const now = new Date();

    // 1. Check Rate Limit
    const limitRecord = await db.prepare(
      "SELECT attempts, locked_until FROM login_attempts WHERE email = ?"
    ).bind(email).first();

    if (limitRecord && limitRecord.locked_until) {
      const lockedUntil = new Date(limitRecord.locked_until);
      if (now < lockedUntil) {
        const secondsLeft = Math.ceil((lockedUntil - now) / 1000);
        return Response.json({ 
          success: false, 
          message: `Too many failed login attempts. Please try again in ${secondsLeft} seconds.` 
        }, { status: 429 });
      }
    }

    const recordFailedAttempt = async () => {
      const maxAttempts = 3;
      const lockDurationMs = 5 * 60 * 1000; // 5 minutes
      
      const record = await db.prepare(
        "SELECT attempts FROM login_attempts WHERE email = ?"
      ).bind(email).first();
      
      if (record) {
        const newAttempts = record.attempts + 1;
        let lockedUntil = null;
        if (newAttempts >= maxAttempts) {
          lockedUntil = new Date(now.getTime() + lockDurationMs).toISOString();
        }
        await db.prepare(
          "UPDATE login_attempts SET attempts = ?, last_attempt = ?, locked_until = ? WHERE email = ?"
        ).bind(newAttempts, now.toISOString(), lockedUntil, email).run();
      } else {
        await db.prepare(
          "INSERT INTO login_attempts (email, attempts, last_attempt, locked_until) VALUES (?, 1, ?, NULL)"
        ).bind(email, now.toISOString()).run();
      }
    };

    const user = await db.prepare(
      "SELECT id, email, password_hash, salt, first_name, last_name, role, is_verified, auth_provider, phone_number, default_delivery_zone, restricted_from_cod FROM users WHERE email = ?"
    ).bind(email).first();

    if (!user) {
      await recordFailedAttempt();
      return Response.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
    }

    if (user.auth_provider === 'google') {
      return Response.json({ success: false, message: 'Please log in with Google.' }, { status: 401 });
    }

    if (!user.is_verified && user.email !== 'admin@zannycollection.com') {
      return Response.json({ success: false, message: 'Email not verified. Please check your email for the code.', needsVerification: true, email: user.email }, { status: 403 });
    }

    // Hash the input password and verify
    let isValid = false;
    let actualHash = user.password_hash || '';
    let actualSaltHex = user.salt || '';

    if (!user.salt && user.password_hash && user.password_hash.startsWith('pbkdf2:')) {
      const parts = user.password_hash.split(':');
      if (parts.length === 3) {
        actualSaltHex = parts[1];
        actualHash = parts[2];
      }
    }

    if (actualSaltHex) {
      const enc = new TextEncoder();
      const keyMaterial = await crypto.subtle.importKey(
        "raw", enc.encode(data.password), "PBKDF2", false, ["deriveBits"]
      );
      // Convert hex string salt back to Uint8Array
      const saltBuffer = new Uint8Array(actualSaltHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
      const hashBuffer = await crypto.subtle.deriveBits(
        { name: "PBKDF2", salt: saltBuffer, iterations: 100000, hash: "SHA-256" },
        keyMaterial, 256
      );
      const inputHash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
      isValid = (inputHash === actualHash);
    }

    if (!isValid) {
      await recordFailedAttempt();
      return Response.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
    }

    // Valid login. Clear rate limit attempts, update tracking and issue session
    await db.prepare("DELETE FROM login_attempts WHERE email = ?").bind(email).run();

    const sessionId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await db.prepare(
      "INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)"
    ).bind(sessionId, user.id, expiresAt.toISOString()).run();

    await db.prepare(
      "UPDATE users SET login_count = login_count + 1, last_login = CURRENT_TIMESTAMP WHERE id = ?"
    ).bind(user.id).run();

    const cookieString = `zanny_session=${sessionId}; HttpOnly; Secure; Path=/; SameSite=Strict; Expires=${expiresAt.toUTCString()}`;

    return new Response(JSON.stringify({ 
      success: true, 
      user: { 
        id: user.id, 
        email: user.email, 
        firstName: user.first_name || (user.full_name ? user.full_name.split(' ')[0] : ''), 
        lastName: user.last_name || (user.full_name ? user.full_name.split(' ').slice(1).join(' ') : ''), 
        role: user.role, 
        phone: user.phone_number || user.phone || '', 
        deliveryZone: user.default_delivery_zone, 
        restricted_from_cod: user.restricted_from_cod 
      } 
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': cookieString
      }
    });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
