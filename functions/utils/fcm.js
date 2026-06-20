// Native JWT & FCM Client for Cloudflare Workers (No dependencies)

function base64url(str) {
  return btoa(str).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function pemToArrayBuffer(pem) {
  const b64 = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\s/g, "");
  const binary = atob(b64);
  const buffer = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    buffer[i] = binary.charCodeAt(i);
  }
  return buffer.buffer;
}

function arrayBufferToString(buf) {
  return String.fromCharCode.apply(null, new Uint8Array(buf));
}

async function signJwt(header, payload, privateKeyPem) {
  const headerStr = base64url(JSON.stringify(header));
  const payloadStr = base64url(JSON.stringify(payload));
  const data = new TextEncoder().encode(`${headerStr}.${payloadStr}`);

  const privateKey = await crypto.subtle.importKey(
    "pkcs8",
    pemToArrayBuffer(privateKeyPem),
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: "SHA-256"
    },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    privateKey,
    data
  );

  const signatureStr = base64url(arrayBufferToString(signature));
  return `${headerStr}.${payloadStr}.${signatureStr}`;
}

export async function getAccessToken(env) {
  const header = { alg: "RS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: env.FIREBASE_CLIENT_EMAIL,
    scope: "https://www.googleapis.com/auth/firebase.messaging",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now
  };

  const jwt = await signJwt(header, payload, env.FIREBASE_PRIVATE_KEY);

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
  });
  const data = await res.json();
  if (data.error) {
    throw new Error(`Google OAuth error: ${data.error_description || data.error}`);
  }
  return data.access_token;
}

export async function broadcastNotification(context, title, body, route) {
  const env = context.env;
  if (!env.FIREBASE_PROJECT_ID || !env.FIREBASE_CLIENT_EMAIL || !env.FIREBASE_PRIVATE_KEY) {
    console.info("⚠️ FCM credentials not fully configured, skipping push notification.");
    return { success: false, reason: "Credentials missing" };
  }

  try {
    const accessToken = await getAccessToken(env);

    // Get all registered FCM tokens
    const { results } = await env.DB.prepare(
      "SELECT fcm_token FROM users WHERE fcm_token IS NOT NULL AND fcm_token != ''"
    ).all();

    if (results.length === 0) {
      return { success: true, count: 0 };
    }

    const promises = results.map(row => {
      return fetch(`https://fcm.googleapis.com/v1/projects/${env.FIREBASE_PROJECT_ID}/messages:send`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: {
            token: row.fcm_token,
            notification: { title, body },
            data: { route: route || "/orders" }
          }
        })
      }).catch(err => {
        console.error(`Failed to send notification to device: ${err.message}`);
        return null;
      });
    });

    await Promise.all(promises);
    return { success: true, count: results.length };
  } catch (e) {
    console.error(`FCM Broadcast failed: ${e.message}`);
    return { success: false, error: e.message };
  }
}
