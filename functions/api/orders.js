export async function onRequestPost(context) {
  try {
    const data = await context.request.json();
    
    // Generate order ID
    const orderId = 'ORD-' + Date.now().toString().slice(-6);
    
    // Insert into orders table
    const orderStmt = context.env.DB.prepare(
      "INSERT INTO orders (id, user_id, total_amount, shipping_address, phone_number, status) VALUES (?, ?, ?, ?, ?, ?)"
    ).bind(
      orderId, 
      data.userId, 
      data.totalAmount, 
      data.shippingAddress, 
      data.phoneNumber,
      'pending'
    );
    
    await orderStmt.run();

    // Insert order items
    // (In a real app we'd use batch execution, but doing it in a loop for simplicity)
    for (const item of data.items) {
      const itemId = crypto.randomUUID();
      await context.env.DB.prepare(
        "INSERT INTO order_items (id, order_id, product_id, quantity, size, price_at_purchase) VALUES (?, ?, ?, ?, ?, ?)"
      ).bind(
        itemId, orderId, item.id, item.qty, item.size, item.price
      ).run();
    }

    return Response.json({ success: true, orderId });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
