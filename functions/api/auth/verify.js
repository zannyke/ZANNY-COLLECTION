export async function onRequestPost(context) {
  try {
    const { email, code } = await context.request.json();
    
    // 1. Verify code
    const record = await context.env.DB.prepare(
      "SELECT * FROM verification_codes WHERE email = ? AND code = ? AND expires_at > CURRENT_TIMESTAMP"
    ).bind(email, code).first();

    if (!record) {
      return Response.json({ success: false, message: 'Invalid or expired code.' }, { status: 400 });
    }

    // 2. Mark user as verified
    await context.env.DB.prepare(
      "UPDATE users SET is_verified = 1 WHERE email = ?"
    ).bind(email).run();

    // 3. Delete used code
    await context.env.DB.prepare(
      "DELETE FROM verification_codes WHERE email = ?"
    ).bind(email).run();

    // 4. Create Session
    const user = await context.env.DB.prepare("SELECT id, email, first_name, last_name, role FROM users WHERE email = ?").bind(email).first();
    const sessionId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    
    await context.env.DB.prepare(
      "INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)"
    ).bind(sessionId, user.id, expiresAt.toISOString()).run();

    // 5. Update login count
    await context.env.DB.prepare(
      "UPDATE users SET login_count = login_count + 1, last_login = CURRENT_TIMESTAMP WHERE id = ?"
    ).bind(user.id).run();

    // 6. Set HttpOnly Cookie
    const cookieString = `zanny_session=${sessionId}; HttpOnly; Secure; Path=/; SameSite=Strict; Expires=${expiresAt.toUTCString()}`;
    
    return new Response(JSON.stringify({ success: true, user: { id: user.id, email: user.email, firstName: user.first_name, lastName: user.last_name, role: user.role } }), {
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': cookieString
      }
    });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
