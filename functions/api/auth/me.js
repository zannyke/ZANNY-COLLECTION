export async function onRequestGet(context) {
  try {
    const cookieHeader = context.request.headers.get('Cookie') || '';
    const match = cookieHeader.match(/zanny_session=([^;]+)/);
    
    if (!match) {
      return Response.json({ authenticated: false }, { status: 401 });
    }
    
    const sessionId = match[1];

    // Verify session
    const sessionRecord = await context.env.DB.prepare(
      "SELECT user_id FROM sessions WHERE id = ? AND expires_at > CURRENT_TIMESTAMP"
    ).bind(sessionId).first();

    if (!sessionRecord) {
      return Response.json({ authenticated: false }, { status: 401 });
    }

    const user = await context.env.DB.prepare(
      "SELECT id, email, first_name, last_name, role, phone_number, default_delivery_zone, restricted_from_cod FROM users WHERE id = ?"
    ).bind(sessionRecord.user_id).first();

    if (!user) {
      return Response.json({ authenticated: false }, { status: 401 });
    }

    return Response.json({
      authenticated: true,
      user: { 
        id: user.id, 
        email: user.email, 
        firstName: user.first_name, 
        lastName: user.last_name, 
        role: user.role,
        phone: user.phone_number,
        deliveryZone: user.default_delivery_zone,
        restricted_from_cod: user.restricted_from_cod
      }
    });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
