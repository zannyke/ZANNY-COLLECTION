export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const clientId = context.env.GOOGLE_CLIENT_ID;
  
  // Explicitly construct the redirect URI to ensure it matches exactly
  const redirectUri = `${url.origin}/api/auth/google/callback`;
  
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=email%20profile&access_type=offline`;
  
  return Response.redirect(googleAuthUrl, 302);
}
