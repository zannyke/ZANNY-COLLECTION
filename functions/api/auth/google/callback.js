export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const code = url.searchParams.get('code');
  const redirectUri = `${url.origin}/api/auth/google/callback`;

  if (!code) {
    return Response.redirect(`${url.origin}/login?error=google_auth_failed`, 302);
  }

  try {
    // 1. Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: context.env.GOOGLE_CLIENT_ID,
        client_secret: context.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      })
    });
    
    if (!tokenRes.ok) {
      throw new Error('Failed to exchange token with Google');
    }
    const tokens = await tokenRes.json();
    
    // 2. Fetch user info
    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { 'Authorization': `Bearer ${tokens.access_token}` }
    });
    
    if (!userRes.ok) {
      throw new Error('Failed to fetch user info from Google');
    }
    const googleUser = await userRes.json();

    if (!googleUser.email) {
      throw new Error('Google did not provide an email address');
    }

    // 3. Upsert user in DB
    let user = await context.env.DB.prepare("SELECT * FROM users WHERE email = ?").bind(googleUser.email).first();
    
    if (!user) {
      const newId = crypto.randomUUID();
      await context.env.DB.prepare(
        "INSERT INTO users (id, email, first_name, last_name, is_verified, auth_provider, login_count, last_login) VALUES (?, ?, ?, ?, 1, 'google', 1, CURRENT_TIMESTAMP)"
      ).bind(newId, googleUser.email, googleUser.given_name || 'User', googleUser.family_name || '').run();
      user = { id: newId, email: googleUser.email };
    } else {
      await context.env.DB.prepare(
        "UPDATE users SET login_count = login_count + 1, last_login = CURRENT_TIMESTAMP, is_verified = 1 WHERE id = ?"
      ).bind(user.id).run();
    }

    // 4. Create session
    const sessionId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    
    await context.env.DB.prepare(
      "INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)"
    ).bind(sessionId, user.id, expiresAt.toISOString()).run();

    const cookieString = `zanny_session=${sessionId}; HttpOnly; Secure; Path=/; SameSite=Strict; Expires=${expiresAt.toUTCString()}`;

    // Redirect to home page with the HttpOnly cookie set
    return new Response(null, {
      status: 302,
      headers: {
        'Location': '/',
        'Set-Cookie': cookieString
      }
    });

  } catch (err) {
    return Response.redirect(`${url.origin}/login?error=google_auth_failed`, 302);
  }
}
