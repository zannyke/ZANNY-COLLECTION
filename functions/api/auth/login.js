export async function onRequestPost(context) {
  try {
    const data = await context.request.json();

    const user = await context.env.DB.prepare(
      "SELECT id, email, password_hash, salt, first_name, last_name, role, is_verified, auth_provider FROM users WHERE email = ?"
    ).bind(data.email).first();

    if (!user) {
      return Response.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
    }

    if (user.auth_provider === 'google') {
      return Response.json({ success: false, message: 'Please log in with Google.' }, { status: 401 });
    }

    if (!user.is_verified) {
      return Response.json({ success: false, message: 'Email not verified. Please check your email for the code.', needsVerification: true, email: user.email }, { status: 403 });
    }

    // Hash the input password with the stored salt
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      "raw", enc.encode(data.password), "PBKDF2", false, ["deriveBits"]
    );
    // Convert hex string salt back to Uint8Array
    const saltBuffer = new Uint8Array(user.salt.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
    const hashBuffer = await crypto.subtle.deriveBits(
      { name: "PBKDF2", salt: saltBuffer, iterations: 100000, hash: "SHA-256" },
      keyMaterial, 256
    );
    const inputHash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

    if (inputHash !== user.password_hash) {
      return Response.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
    }

    // Valid login. Update tracking and issue session
    const sessionId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await context.env.DB.prepare(
      "INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)"
    ).bind(sessionId, user.id, expiresAt.toISOString()).run();

    await context.env.DB.prepare(
      "UPDATE users SET login_count = login_count + 1, last_login = CURRENT_TIMESTAMP WHERE id = ?"
    ).bind(user.id).run();

    const cookieString = `zanny_session=${sessionId}; HttpOnly; Secure; Path=/; SameSite=Strict; Expires=${expiresAt.toUTCString()}`;

    return new Response(JSON.stringify({ 
      success: true, 
      user: { id: user.id, email: user.email, firstName: user.first_name, lastName: user.last_name, role: user.role } 
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
