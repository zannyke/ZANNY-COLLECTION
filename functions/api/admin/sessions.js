import { requireAdmin } from '../../utils/auth.js';

export async function onRequestGet(context) {
  try {
    const auth = await requireAdmin(context);
    if (auth instanceof Response) return auth;

    const { results } = await context.env.DB.prepare(
      "SELECT id, ip_address, user_agent, device_name, created_at, expires_at FROM sessions WHERE user_id = ? ORDER BY created_at DESC"
    ).bind(auth.user.id).all();

    // Identify current session from cookie
    const cookieHeader = context.request.headers.get('Cookie') || '';
    const match = cookieHeader.match(/zanny_session=([^;]+)/);
    const currentSessionId = match ? match[1] : null;

    const sessions = results.map(s => ({
      ...s,
      is_current: s.id === currentSessionId
    }));

    return Response.json(sessions);
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function onRequestDelete(context) {
  try {
    const auth = await requireAdmin(context);
    if (auth instanceof Response) return auth;

    const { id } = await context.request.json();
    if (!id) return Response.json({ error: 'Session ID required' }, { status: 400 });

    await context.env.DB.prepare(
      "DELETE FROM sessions WHERE id = ? AND user_id = ?"
    ).bind(id, auth.user.id).run();

    return Response.json({ success: true, message: 'Session revoked' });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
