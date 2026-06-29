import { requireAdmin } from '../../utils/auth.js';

export async function onRequestPut(context) {
  try {
    const auth = await requireAdmin(context);
    if (auth instanceof Response) return auth; // returns 403 if not admin
    const adminId = auth.user.id;

    const { oldPassword, newPassword } = await context.request.json();
    if (!oldPassword || !newPassword) {
      return Response.json({ error: 'Both old and new passwords are required' }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return Response.json({ error: 'New password must be at least 8 characters long' }, { status: 400 });
    }

    // Verify old password
    const admin = await context.env.DB.prepare(
      "SELECT password_hash, salt FROM users WHERE id = ?"
    ).bind(adminId).first();

    let actualHash = admin.password_hash || '';
    let actualSaltHex = admin.salt || '';

    if (admin.password_hash && admin.password_hash.startsWith('pbkdf2:')) {
      const parts = admin.password_hash.split(':');
      if (parts.length === 3) {
        if (!actualSaltHex) actualSaltHex = parts[1];
        actualHash = parts[2];
      }
    }

    if (!actualHash || !actualSaltHex) {
      return Response.json({ error: 'Admin password record is corrupted or incomplete' }, { status: 500 });
    }

    const enc = new TextEncoder();
    const oldKeyMaterial = await crypto.subtle.importKey("raw", enc.encode(oldPassword), "PBKDF2", false, ["deriveBits"]);
    const oldSaltBuffer = new Uint8Array(actualSaltHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
    const oldHashBuffer = await crypto.subtle.deriveBits({ name: "PBKDF2", salt: oldSaltBuffer, iterations: 100000, hash: "SHA-256" }, oldKeyMaterial, 256);
    const oldInputHash = Array.from(new Uint8Array(oldHashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

    if (oldInputHash !== actualHash) {
      await new Promise(res => setTimeout(res, 500));
      return Response.json({ error: 'Incorrect current password' }, { status: 401 });
    }

    // Generate new salt and hash for new password
    const newSaltBuffer = crypto.getRandomValues(new Uint8Array(16));
    const newSaltHex = Array.from(newSaltBuffer).map(b => b.toString(16).padStart(2, '0')).join('');
    const newKeyMaterial = await crypto.subtle.importKey("raw", enc.encode(newPassword), "PBKDF2", false, ["deriveBits"]);
    const newHashBuffer = await crypto.subtle.deriveBits({ name: "PBKDF2", salt: newSaltBuffer, iterations: 100000, hash: "SHA-256" }, newKeyMaterial, 256);
    const newPassHex = Array.from(new Uint8Array(newHashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

    // Update password in DB and clear all other sessions to force re-login on other devices
    await context.env.DB.prepare(
      "UPDATE users SET password_hash = ?, salt = ? WHERE id = ?"
    ).bind(newPassHex, newSaltHex, adminId).run();

    // Get current session ID from cookie so we don't delete it
    const cookieHeader = context.request.headers.get('Cookie') || '';
    const match = cookieHeader.match(/zanny_session=([^;]+)/);
    if (match) {
      await context.env.DB.prepare(
        "DELETE FROM sessions WHERE user_id = ? AND id != ?"
      ).bind(adminId, match[1]).run();
    }

    return Response.json({ success: true, message: 'Password updated securely' });

  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
