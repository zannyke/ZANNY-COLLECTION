export async function onRequestGet(context) {
  try {
    // context.env.DB is the D1 binding defined in wrangler.toml
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
    // This will receive data from AddProduct.jsx
    const data = await context.request.json();
    const id = Date.now().toString(); // Simple ID generation
    
    // Insert into D1 securely
    const stmt = context.env.DB.prepare(
      "INSERT INTO products (id, name, category, description, price, stock, badge, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
    ).bind(
      id, 
      data.name, 
      data.category, 
      data.description, 
      Number(data.price), 
      Number(data.stock), 
      data.badge || null, 
      data.image || ''
    );
    
    await stmt.run();
    
    return Response.json({ success: true, id });
  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
