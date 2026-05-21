export async function onRequestGet(context) {
  try {
    const { results } = await context.env.DB.prepare(
      "SELECT * FROM products ORDER BY created_at DESC"
    ).all();
    return Response.json(results);
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function onRequestPost(context) {
  try {
    const data = await context.request.json();
    const id = crypto.randomUUID();

    await context.env.DB.prepare(
      `INSERT INTO products (id, name, category, description, price, original_price, discount_label, stock, sold, badge, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)`
    ).bind(
      id,
      data.name,
      data.category,
      data.description || '',
      Number(data.price),
      data.original_price ? Number(data.original_price) : null,
      data.discount_label || null,
      Number(data.stock),
      data.badge || null,
      data.image || ''
    ).run();

    return Response.json({ success: true, id });
  } catch (err) {
    // Return the real error so the browser console shows what went wrong
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function onRequestPatch(context) {
  try {
    const { id, stock } = await context.request.json();
    if (typeof stock !== 'number') {
      return Response.json({ error: 'Invalid stock value' }, { status: 400 });
    }
    await context.env.DB.prepare("UPDATE products SET stock = ? WHERE id = ?").bind(stock, id).run();
    return Response.json({ success: true });
  } catch(err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
