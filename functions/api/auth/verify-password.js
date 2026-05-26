import { getCurrentUser } from '../../utils/auth.js';

export async function onRequestPost(context) {
  try {
    const user = await getCurrentUser(context);
    if (!user) return Response.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const { password } = await context.request.json();
    
    if (!password) {
      return Response.json({ success: false, message: 'Password is required' }, { status: 400 });
    }
    
    // Fetch full user record to get password hash and salt
    const dbUser = await context.env.DB.prepare(
      "SELECT password_hash, salt FROM users WHERE id = ?"
    ).bind(user.id).first();

    if (!dbUser) return Response.json({ success: false, message: 'User not found' }, { status: 404 });

    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
    
    // Parse the stored salt
    const saltBuffer = new Uint8Array(dbUser.salt.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
    
    const hashBuffer = await crypto.subtle.deriveBits(
      { name: "PBKDF2", salt: saltBuffer, iterations: 100000, hash: "SHA-256" }, 
      keyMaterial, 256
    );
    const inputHash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

    if (inputHash !== dbUser.password_hash) {
      // Small delay to prevent timing attacks
      await new Promise(res => setTimeout(res, 500));
      return Response.json({ success: false, message: 'Incorrect password' }, { status: 401 });
    }

    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
