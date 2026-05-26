import { requireAdmin } from '../../utils/auth.js';

export async function onRequestGet(context) {
  try {
    const auth = await requireAdmin(context);
    if (auth instanceof Response) return auth;

    const { results } = await context.env.DB.prepare(
      "SELECT * FROM blacklisted_ips ORDER BY created_at DESC"
    ).all();

    return Response.json(results);
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function onRequestPost(context) {
  try {
    const auth = await requireAdmin(context);
    if (auth instanceof Response) return auth;

    const { ip_address, reason } = await context.request.json();
    if (!ip_address) return Response.json({ error: 'IP address required' }, { status: 400 });

    const id = crypto.randomUUID();
    await context.env.DB.prepare(
      "INSERT INTO blacklisted_ips (id, ip_address, reason) VALUES (?, ?, ?)"
    ).bind(id, ip_address, reason || 'Manually blocked by admin').run();

    return Response.json({ success: true, message: 'IP blacklisted' });
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return Response.json({ error: 'IP is already blacklisted' }, { status: 400 });
    }
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function onRequestDelete(context) {
  try {
    const auth = await requireAdmin(context);
    if (auth instanceof Response) return auth;

    const { id } = await context.request.json();
    if (!id) return Response.json({ error: 'Blacklist ID required' }, { status: 400 });

    await context.env.DB.prepare(
      "DELETE FROM blacklisted_ips WHERE id = ?"
    ).bind(id).run();

    return Response.json({ success: true, message: 'IP unblocked' });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
