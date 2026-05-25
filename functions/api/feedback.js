import { getCurrentUser } from '../utils/auth.js';

export async function onRequestGet(context) {
  try {
    const { results } = await context.env.DB.prepare(`
      SELECT f.*, o.user_id 
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
    const user = await getCurrentUser(context);
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await context.request.json();
    const { orderId, rating, comment } = data;

    if (!orderId || !rating) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify order exists, is delivered, and belongs to the user
    const order = await context.env.DB.prepare(
      "SELECT status, user_id FROM orders WHERE id = ?"
    ).bind(orderId).first();

    if (!order || order.status !== 'delivered') {
      return Response.json({ error: 'Order not eligible for feedback' }, { status: 400 });
    }

    if (order.user_id !== user.id && user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: You do not own this order' }, { status: 403 });
    }

    // Verify if feedback already exists
    const existing = await context.env.DB.prepare(
      "SELECT id FROM feedback WHERE order_id = ?"
    ).bind(orderId).first();
    
    if (existing) {
      return Response.json({ error: 'Feedback already submitted for this order' }, { status: 400 });
    }

    // Input Validation: Strip HTML tags to prevent Stored XSS
    const sanitizedComment = (comment || '').replace(/<[^>]*>?/gm, '').substring(0, 1000);

    // Insert feedback
    const feedbackId = 'FB-' + Date.now().toString().slice(-6);
    await context.env.DB.prepare(
      "INSERT INTO feedback (id, order_id, rating, comment) VALUES (?, ?, ?, ?)"
    ).bind(feedbackId, orderId, rating, sanitizedComment).run();

    return Response.json({ success: true, feedbackId });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
