export async function onRequestPost(context) {
  try {
    const data = await context.request.json();
    
    // 1. Generate salt and hash password using PBKDF2
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      "raw", enc.encode(data.password), "PBKDF2", false, ["deriveBits"]
    );
    const saltBuffer = crypto.getRandomValues(new Uint8Array(16));
    const hashBuffer = await crypto.subtle.deriveBits(
      { name: "PBKDF2", salt: saltBuffer, iterations: 100000, hash: "SHA-256" },
      keyMaterial, 256
    );
    const salt = Array.from(saltBuffer).map(b => b.toString(16).padStart(2, '0')).join('');
    const passwordHash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

    const userId = crypto.randomUUID();

    // 2. Insert user into DB (is_verified = 0)
    await context.env.DB.prepare(
      "INSERT INTO users (id, email, password_hash, salt, first_name, last_name, role, is_verified, auth_provider) VALUES (?, ?, ?, ?, ?, ?, ?, 0, 'local')"
    ).bind(userId, data.email, passwordHash, salt, data.firstName, data.lastName, 'customer').run();

    // 3. Generate 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const codeId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 mins
    
    await context.env.DB.prepare(
      "INSERT INTO verification_codes (id, email, code, expires_at) VALUES (?, ?, ?, ?)"
    ).bind(codeId, data.email, code, expiresAt).run();

    // 4. Send Email via Resend
    if (context.env.RESEND_API_KEY) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${context.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'Zanny Collection <onboarding@resend.dev>', // Resend testing email
          to: data.email,
          subject: 'Zanny Collection - Your Verification Code',
          html: `<div style="font-family:sans-serif; text-align:center;">
                   <h2>Welcome to Zanny Collection</h2>
                   <p>Your verification code is:</p>
                   <h1 style="letter-spacing:5px;">${code}</h1>
                   <p>This code will expire in 15 minutes.</p>
                 </div>`
        })
      });
    }

    return Response.json({ 
      success: true, 
      message: 'Registration successful. Please check your email for the verification code.',
      email: data.email 
    });
  } catch (err) {
    if (err.message.includes('UNIQUE constraint failed')) {
      return Response.json({ success: false, message: 'Email already exists' }, { status: 400 });
    }
    return Response.json({ error: err.message }, { status: 500 });
  }
}
