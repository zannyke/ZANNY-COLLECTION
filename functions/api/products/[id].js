export async function onRequestDelete(context) {
  try {
    const id = context.params.id;

    // 1. Get the product to find the image_url
    const product = await context.env.DB.prepare("SELECT * FROM products WHERE id = ?").bind(id).first();
    
    if (!product) {
      return new Response('Not found', { status: 404 });
    }

    // 2. Delete the image from R2 if it exists
    if (product.image_url) {
      // The image_url looks like "/api/images/products/xxxx.png"
      // We extract the key: "products/xxxx.png"
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
