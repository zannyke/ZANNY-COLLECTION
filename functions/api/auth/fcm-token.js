import { getCurrentUser } from '../../utils/auth.js';

export async function onRequestPost(context) {
  try {
    const user = await getCurrentUser(context);
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { token } = await context.request.json();
    if (!token) {
      return Response.json({ error: 'Token is required' }, { status: 400 });
    }

    // Save token to users table
    await context.env.DB.prepare(
      "UPDATE users SET fcm_token = ? WHERE id = ?"
    ).bind(token, user.id).run();

    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
