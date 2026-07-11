// functions/api/auth/forgot-password.js

export async function onRequestPost(context) {
  try {
    const data = await context.request.json().catch(() => ({}));
    const email = (data.email || '').trim().toLowerCase();

    if (!email) {
      return Response.json({ success: false, message: 'Email is required' }, { status: 400 });
    }

    const db = context.env.DB;

    // 1. Check if user exists
    const user = await db.prepare(
      "SELECT id FROM users WHERE email = ? AND auth_provider = 'local'"
    ).bind(email).first();

    // To prevent email harvesting/enumeration, return success even if user doesn't exist
    if (!user) {
      return Response.json({ 
        success: true, 
        message: 'If the email matches an active account, a 6-digit code has been sent.' 
      });
    }

    // 2. Generate 6-digit code and expiration (15 minutes)
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    // 3. Store in password_resets table (upsert)
    await db.prepare(
      "INSERT OR REPLACE INTO password_resets (email, token, expires_at, created_at) VALUES (?, ?, ?, datetime('now'))"
    ).bind(email, code, expiresAt).run();

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
          to: email,
          subject: 'Zanny Collection - Password Reset Code',
          html: `
            <div style="font-family: 'Inter', sans-serif; background-color: #fafafa; padding: 40px 20px; text-align: center; color: #1a1a1a;">
              <div style="max-width: 500px; margin: 0 auto; background: #ffffff; padding: 30px; border: 1px solid #eee; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.02);">
                <h1 style="font-size: 24px; font-weight: 800; letter-spacing: 2px; margin-bottom: 20px;">ZANNY</h1>
                <h2 style="font-size: 18px; font-weight: 600; color: #555; margin-bottom: 10px;">Password Reset Request</h2>
                <p style="font-size: 14px; color: #777; line-height: 1.6; margin-bottom: 25px;">
                  We received a request to reset your password. Use the verification code below to authorize the change.
                </p>
                <div style="background: #f4f4f4; padding: 15px; border-radius: 6px; display: inline-block; margin-bottom: 25px;">
                  <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; font-family: monospace; color: #1a1a1a; padding-left: 8px;">${code}</span>
                </div>
                <p style="font-size: 12px; color: #999; line-height: 1.5;">
                  This code is valid for 15 minutes. If you did not make this request, you can safely ignore this email.
                </p>
              </div>
            </div>
          `
        })
      });
    }

    return Response.json({ 
      success: true, 
      message: 'If the email matches an active account, a 6-digit code has been sent.' 
    });

  } catch (err) {
    console.error('Forgot password error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
