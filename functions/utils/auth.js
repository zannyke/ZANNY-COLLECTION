export async function getCurrentUser(context) {
  const cookieHeader = context.request.headers.get('Cookie') || '';
  const match = cookieHeader.match(/zanny_session=([^;]+)/);
  if (!match) return null;
  
  const sessionId = match[1];
  const sessionRecord = await context.env.DB.prepare(
    "SELECT user_id FROM sessions WHERE id = ? AND expires_at > CURRENT_TIMESTAMP"
  ).bind(sessionId).first();

  if (!sessionRecord) return null;

  const user = await context.env.DB.prepare(
    "SELECT id, role FROM users WHERE id = ?"
  ).bind(sessionRecord.user_id).first();

  return user;
}

export async function requireAuth(context) {
  const user = await getCurrentUser(context);
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized access' }), { 
      status: 401, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }
  return { user };
}

export async function requireAdmin(context) {
  const user = await getCurrentUser(context);
  if (!user || user.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Forbidden: Admin access required' }), { 
      status: 403, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }
  return { user };
}
