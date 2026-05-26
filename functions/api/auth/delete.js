import { requireAdmin } from '../../utils/auth.js';

export async function onRequestDelete(context) {
  try {
    const auth = await requireAdmin(context);
    if (auth instanceof Response) return auth;

    const url = new URL(context.request.url);
    const id = url.searchParams.get('id');

    if (!id) return Response.json({ success: false }, { status: 400 });

    await context.env.DB.prepare("DELETE FROM users WHERE id = ?").bind(id).run();

    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
