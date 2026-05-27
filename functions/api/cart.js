import { getCurrentUser } from '../utils/auth.js';

// GET /api/cart - Fetch all synced cart items for user
export async function onRequestGet(context) {
  try {
    const user = await getCurrentUser(context);
    if (!user) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Join with products table to get up-to-date name, price, and image details
    const items = await context.env.DB.prepare(`
      SELECT 
        c.id as key,
        c.product_id as id,
        c.quantity as qty,
        c.size,
        c.color,
        p.name,
        p.price,
        p.image_url
      FROM cart_items c
      JOIN products p ON c.product_id = p.id
      WHERE c.user_id = ?
    `).bind(user.id).all();

    return Response.json({ success: true, items: items.results || [] });
  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST /api/cart - Sync (overwrite) entire cart list for user
export async function onRequestPost(context) {
  try {
    const user = await getCurrentUser(context);
    if (!user) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { items } = await context.request.json();
    if (!Array.isArray(items)) {
      return Response.json({ success: false, error: 'Invalid items array' }, { status: 400 });
    }

    // Delete existing cart items for this user
    await context.env.DB.prepare("DELETE FROM cart_items WHERE user_id = ?").bind(user.id).run();

    // Batch insert new items if there are any
    if (items.length > 0) {
      const statements = items.map(item => {
        const key = `${user.id}-${item.id}-${item.color || ''}-${item.size || ''}`;
        return context.env.DB.prepare(`
          INSERT INTO cart_items (id, user_id, product_id, quantity, size, color)
          VALUES (?, ?, ?, ?, ?, ?)
        `).bind(
          key,
          user.id,
          item.id,
          item.qty || 1,
          item.size || '',
          item.color || ''
        );
      });
      
      await context.env.DB.batch(statements);
    }

    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
