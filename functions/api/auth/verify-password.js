import { getCurrentUser } from '../../utils/auth.js';

async function verifyHash(password, salt, storedHash) {
  try {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
    const saltBuffer = new Uint8Array(salt.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
    const hashBuffer = await crypto.subtle.deriveBits(
      { name: "PBKDF2", salt: saltBuffer, iterations: 100000, hash: "SHA-256" }, 
      keyMaterial, 256
    );
    const inputHash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
    return inputHash === storedHash;
  } catch (e) {
    return false;
  }
}

export async function onRequestPost(context) {
  try {
    const user = await getCurrentUser(context);
    if (!user) return Response.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const { password } = await context.request.json();
    
    if (!password) {
      return Response.json({ success: false, message: 'Password is required' }, { status: 400 });
    }
    
    const db = context.env.DB;
    const now = new Date();

    // Fetch full user record to get password hash, salt, and email
    const dbUser = await db.prepare(
      "SELECT email, password_hash, salt FROM users WHERE id = ?"
    ).bind(user.id).first();

    if (!dbUser) return Response.json({ success: false, message: 'User not found' }, { status: 404 });

    const email = dbUser.email;

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
          message: `Too many failed attempts. Please try again in ${secondsLeft} seconds.`,
          secondsLeft
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

    let isMatch = false;
    if (dbUser.password_hash && dbUser.salt) {
      isMatch = await verifyHash(password, dbUser.salt, dbUser.password_hash);
    }

    // If verification fails but they are an admin, try verifying against the master admin's password
    if (!isMatch && user.role === 'admin') {
      const masterAdmin = await db.prepare(
        "SELECT password_hash, salt FROM users WHERE role = 'admin' ORDER BY created_at ASC LIMIT 1"
      ).first();
      
      if (masterAdmin && masterAdmin.password_hash && masterAdmin.salt) {
        isMatch = await verifyHash(password, masterAdmin.salt, masterAdmin.password_hash);
      }
    }

    if (!isMatch) {
      await recordFailedAttempt();
      // Small delay to prevent timing attacks
      await new Promise(res => setTimeout(res, 500));
      return Response.json({ success: false, message: 'Incorrect password' }, { status: 401 });
    }

    // Clear rate limit attempts on success
    await db.prepare("DELETE FROM login_attempts WHERE email = ?").bind(email).run();

    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

