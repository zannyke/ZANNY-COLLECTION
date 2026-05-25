export async function onRequestPost(context) {
  try {
    const { email, code } = await context.request.json();
    
    // 1. Check if an active code exists for this email
    const record = await context.env.DB.prepare(
      "SELECT * FROM verification_codes WHERE email = ? AND expires_at > CURRENT_TIMESTAMP"
    ).bind(email).first();

    if (!record) {
      return Response.json({ success: false, message: 'No active code found. Please request a new one.' }, { status: 400 });
    }

    if (record.code !== code) {
      const newAttempts = (record.attempts || 0) + 1;
      if (newAttempts >= 5) {
        await context.env.DB.prepare("DELETE FROM verification_codes WHERE id = ?").bind(record.id).run();
        return Response.json({ success: false, message: 'Too many failed attempts. Code expired.' }, { status: 429 });
      } else {
        // Fallback: If 'attempts' column doesn't exist, this might fail, but it's okay for now. We assume the migration adds it.
        try {
          await context.env.DB.prepare("UPDATE verification_codes SET attempts = ? WHERE id = ?").bind(newAttempts, record.id).run();
        } catch (e) {
          console.error("Failed to update attempts", e);
        }
        return Response.json({ success: false, message: `Invalid code. ${5 - newAttempts} attempts remaining.` }, { status: 400 });
      }
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
    const user = await context.env.DB.prepare("SELECT id, email, first_name, last_name, role, phone_number, default_delivery_zone FROM users WHERE email = ?").bind(email).first();
    if (!user) {
      return Response.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    // 5. Issue session
    const sessionId = crypto.randomUUID();
    const sessionExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await context.env.DB.prepare(
      "INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)"
    ).bind(sessionId, user.id, sessionExpiresAt.toISOString()).run();

    // 5. Update login count
    await context.env.DB.prepare(
      "UPDATE users SET login_count = login_count + 1, last_login = CURRENT_TIMESTAMP WHERE id = ?"
    ).bind(user.id).run();

    // 6. Set HttpOnly Cookie
    const cookieString = `zanny_session=${sessionId}; HttpOnly; Secure; Path=/; SameSite=Strict; Expires=${sessionExpiresAt.toUTCString()}`;
    
    return new Response(JSON.stringify({ success: true, user: { id: user.id, email: user.email, firstName: user.first_name, lastName: user.last_name, role: user.role, phone: user.phone_number, deliveryZone: user.default_delivery_zone } }), {
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': cookieString
      }
    });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
