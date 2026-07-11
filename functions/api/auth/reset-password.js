// functions/api/auth/reset-password.js

export async function onRequestPost(context) {
  try {
    const data = await context.request.json().catch(() => ({}));
    const email = (data.email || '').trim().toLowerCase();
    const code = (data.code || '').trim();
    const newPassword = data.password;

    if (!email || !code || !newPassword) {
      return Response.json({ success: false, message: 'Email, code, and new password are required.' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return Response.json({ success: false, message: 'New password must be at least 6 characters long.' }, { status: 400 });
    }

    const db = context.env.DB;
    const now = new Date();

    // 1. Retrieve the password reset record
    const resetRecord = await db.prepare(
      "SELECT token, expires_at FROM password_resets WHERE email = ?"
    ).bind(email).first();

    if (!resetRecord) {
      return Response.json({ success: false, message: 'Invalid or expired verification code.' }, { status: 400 });
    }

    // 2. Validate code and expiration
    const isCodeValid = resetRecord.token === code;
    const isExpired = now > new Date(resetRecord.expires_at);

    if (!isCodeValid || isExpired) {
      return Response.json({ success: false, message: 'Invalid or expired verification code.' }, { status: 400 });
    }

    // 3. Hash the new password using PBKDF2 (matching registration/verification hashing)
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      "raw", enc.encode(newPassword), "PBKDF2", false, ["deriveBits"]
    );
    const saltBuffer = crypto.getRandomValues(new Uint8Array(16));
    const hashBuffer = await crypto.subtle.deriveBits(
      { name: "PBKDF2", salt: saltBuffer, iterations: 100000, hash: "SHA-256" },
      keyMaterial, 256
    );
    const salt = Array.from(saltBuffer).map(b => b.toString(16).padStart(2, '0')).join('');
    const passwordHash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

    // 4. Update the user password in D1 database
    await db.prepare(
      "UPDATE users SET password_hash = ?, salt = ? WHERE email = ?"
    ).bind(passwordHash, salt, email).run();

    // 5. Delete the reset token so it can't be reused
    await db.prepare(
      "DELETE FROM password_resets WHERE email = ?"
    ).bind(email).run();

    return Response.json({ 
      success: true, 
      message: 'Password reset successful. You can now log in with your new password.' 
    });

  } catch (err) {
    console.error('Reset password error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
