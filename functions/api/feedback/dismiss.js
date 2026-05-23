export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const body = await request.json();
    const { orderId } = body;

    if (!orderId) {
      return new Response(JSON.stringify({ error: 'Missing orderId' }), { status: 400 });
    }

    await env.DB.prepare(
      "UPDATE orders SET review_prompt_dismissed = 1 WHERE id = ?"
    ).bind(orderId).run();

    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
