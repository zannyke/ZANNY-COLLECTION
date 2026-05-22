export async function onRequestDelete(context) {
  try {
    const id = context.params.id;

    // 1. Get the product to find the image_url
    const product = await context.env.DB.prepare("SELECT * FROM products WHERE id = ?").bind(id).first();
    
    if (!product) {
      return new Response('Not found', { status: 404 });
    }

    // Unlink from historical orders to prevent Foreign Key constraint failures
    await context.env.DB.prepare("UPDATE order_items SET product_id = NULL WHERE product_id = ?").bind(id).run();

    // 2. Delete the image from R2 if it exists
    if (product.image_url) {
      const keyMatch = product.image_url.match(/\/api\/images\/(.+)$/);
      if (keyMatch && keyMatch[1]) {
        await context.env.BUCKET.delete(keyMatch[1]);
      }
    }

    // 3. Delete the product from the D1 Database
    await context.env.DB.prepare("DELETE FROM products WHERE id = ?").bind(id).run();

    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function onRequestPut(context) {
  try {
    const id = context.params.id;
    const data = await context.request.json();

    const { name, category, description, price, original_price, discount_label, stock, badge, image_url, variations, gallery_urls } = data;

    await context.env.DB.prepare(`
      UPDATE products 
      SET name = ?, category = ?, description = ?, price = ?, original_price = ?, discount_label = ?, stock = ?, badge = ?, image_url = ?, variations = ?, gallery_urls = ?
      WHERE id = ?
    `).bind(
      name, category, description, 
      price || 0, 
      original_price || null, 
      discount_label || null, 
      stock || 0, 
      badge || null, 
      image_url || null, 
      variations || null, 
      gallery_urls ? JSON.stringify(gallery_urls) : null,
      id
    ).run();

    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
