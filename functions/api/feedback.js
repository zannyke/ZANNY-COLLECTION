export async function onRequestGet(context) {
  try {
    const { results } = await context.env.DB.prepare(`
      SELECT f.*, o.user_id, o.shipping_address 
      FROM feedback f
      JOIN orders o ON f.order_id = o.id
      ORDER BY f.created_at DESC
    `).all();
    return Response.json(results);
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function onRequestPost(context) {
  try {
    const data = await context.request.json();
    const { orderId, rating, comment } = data;

    if (!orderId || !rating) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify order exists and is delivered
    const order = await context.env.DB.prepare(
      "SELECT status FROM orders WHERE id = ?"
    ).bind(orderId).first();

    if (!order || order.status !== 'delivered') {
      return Response.json({ error: 'Order not eligible for feedback' }, { status: 400 });
    }

    // Insert feedback
    const feedbackId = 'FB-' + Date.now().toString().slice(-6);
    await context.env.DB.prepare(
      "INSERT INTO feedback (id, order_id, rating, comment) VALUES (?, ?, ?, ?)"
    ).bind(feedbackId, orderId, rating, comment || '').run();

    return Response.json({ success: true, feedbackId });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
