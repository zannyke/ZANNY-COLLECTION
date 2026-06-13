export async function onRequestGet(context) {
  try {
    const { request, env } = context;
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    if (!userId || userId === 'guest') {
      return new Response(JSON.stringify({ pending: null }), { status: 200 });
    }

    // Find the most recent delivered order that hasn't been dismissed
    // AND doesn't exist in the feedback table.
    const order = await env.DB.prepare(`
      SELECT o.id, o.total_amount, o.created_at, o.items
      FROM orders o
      LEFT JOIN feedback f ON o.id = f.order_id
      WHERE o.user_id = ? 
        AND o.status = 'delivered'
        AND (o.review_prompt_dismissed IS NULL OR o.review_prompt_dismissed = 0)
        AND f.id IS NULL
      ORDER BY o.created_at DESC
      LIMIT 1
    `).bind(userId).first();

    if (!order) {
      return new Response(JSON.stringify({ pending: null }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    let items = [];
    try {
      if (order.items) {
        const rawItems = JSON.parse(order.items);
        if (Array.isArray(rawItems)) {
          items = rawItems.map(item => ({
            quantity: item.quantity || 1,
            size: item.selected_size || '',
            name: item.product?.name || '',
            image_url: item.product?.images?.[0] || item.product?.image_url || ''
          }));
        }
      }
    } catch (e) {
      console.error("Failed to parse items for feedback pending", e);
    }

    return new Response(JSON.stringify({ 
      pending: { ...order, items } 
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
