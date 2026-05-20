export async function onRequestPost(context) {
  try {
    const cookieHeader = context.request.headers.get('Cookie') || '';
    const match = cookieHeader.match(/zanny_session=([^;]+)/);
    
    if (match) {
      const sessionId = match[1];
      // Delete session from DB
      await context.env.DB.prepare("DELETE FROM sessions WHERE id = ?").bind(sessionId).run();
    }

    // Clear cookie
    const cookieString = `zanny_session=; HttpOnly; Secure; Path=/; SameSite=Strict; Max-Age=0`;

    return new Response(JSON.stringify({ success: true }), {
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': cookieString
      }
    });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
