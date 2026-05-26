export async function onRequestPost(context) {
  try {
    const { password } = await context.request.json();
    if (!password) {
      return Response.json({ success: false, message: 'Password required' }, { status: 400 });
    }

    // Look for the admin user
    let admin = await context.env.DB.prepare(
      "SELECT id, password_hash, salt FROM users WHERE role = 'admin' LIMIT 1"
    ).first();

    // Auto-migration: Create default admin if it doesn't exist
    if (!admin) {
      const saltBuffer = crypto.getRandomValues(new Uint8Array(16));
      const saltHex = Array.from(saltBuffer).map(b => b.toString(16).padStart(2, '0')).join('');
      const enc = new TextEncoder();
      const keyMaterial = await crypto.subtle.importKey("raw", enc.encode('zanny2026'), "PBKDF2", false, ["deriveBits"]);
      const hashBuffer = await crypto.subtle.deriveBits({ name: "PBKDF2", salt: saltBuffer, iterations: 100000, hash: "SHA-256" }, keyMaterial, 256);
      const passHex = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
      
      const adminId = crypto.randomUUID();
      await context.env.DB.prepare(`
        INSERT INTO users (id, email, password_hash, salt, first_name, last_name, role, is_verified) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(adminId, 'admin@zannycollection.com', passHex, saltHex, 'System', 'Admin', 'admin', 1).run();

      admin = { id: adminId, password_hash: passHex, salt: saltHex };
    }

    // Verify password
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
    const saltBuffer = new Uint8Array(admin.salt.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
    const hashBuffer = await crypto.subtle.deriveBits({ name: "PBKDF2", salt: saltBuffer, iterations: 100000, hash: "SHA-256" }, keyMaterial, 256);
    const inputHash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

    if (inputHash !== admin.password_hash) {
      // Small delay to prevent timing attacks
      await new Promise(res => setTimeout(res, 500));
      return Response.json({ success: false, message: 'Invalid admin credentials' }, { status: 401 });
    }

    // Valid login. Issue session
    const sessionId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await context.env.DB.prepare(
      "INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)"
    ).bind(sessionId, admin.id, expiresAt.toISOString()).run();

    const cookieString = `zanny_session=${sessionId}; HttpOnly; Secure; Path=/; SameSite=Strict; Expires=${expiresAt.toUTCString()}`;

    return new Response(JSON.stringify({ success: true }), {
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': cookieString
      }
    });

  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
