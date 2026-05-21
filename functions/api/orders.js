export async function onRequestGet(context) {
  try {
    // Fetch all orders newest first
    const { results: orders } = await context.env.DB.prepare(
      "SELECT * FROM orders ORDER BY created_at DESC"
    ).all();

    // For each order, fetch its items
    const enriched = await Promise.all(orders.map(async (order) => {
      const { results: items } = await context.env.DB.prepare(
        `SELECT oi.*, p.name as product_name, p.image_url
         FROM order_items oi
         LEFT JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = ?`
      ).bind(order.id).all();
      return { ...order, items };
    }));

    return Response.json(enriched);
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

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

      // Increment sold count in products table
      await context.env.DB.prepare(
        "UPDATE products SET sold = sold + ? WHERE id = ?"
      ).bind(item.qty, item.id).run();
    }

    // Send email notification to Admin
    if (context.env.RESEND_API_KEY) {
      try {
        const itemsHtml = data.items.map(item => `<li>${item.qty}x Item ID [${item.id}] (Size: ${item.size}) - KSh ${item.price.toLocaleString()}</li>`).join('');
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${context.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'Zanny Collection <onboarding@resend.dev>', // Resend testing domain
            to: 'zannykenya254@gmail.com', // Admin Email
            subject: `New Order Received! [${orderId}]`,
            html: `
              <div style="font-family:sans-serif;">
                <h2>🎉 New Order Placed!</h2>
                <p><strong>Order ID:</strong> ${orderId}</p>
                <p><strong>Total:</strong> KSh ${data.totalAmount.toLocaleString()}</p>
                <p><strong>Phone Number:</strong> ${data.phoneNumber}</p>
                <p><strong>Delivery Address:</strong> ${data.shippingAddress}</p>
                <h3>Items Ordered:</h3>
                <ul>${itemsHtml}</ul>
                <p>Log into your <a href="https://zanny-collection.pages.dev/admin">Admin Dashboard</a> to manage this order.</p>
              </div>
            `
          })
        });
      } catch (emailErr) {
        console.error("Failed to send admin notification email", emailErr);
      }
    }

    return Response.json({ success: true, orderId });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// PATCH /api/orders  — update order status
export async function onRequestPatch(context) {
  try {
    const { id, status } = await context.request.json();
    const allowed = ['pending', 'confirmed', 'shipped', 'fulfilled', 'cancelled'];
    if (!allowed.includes(status)) {
      return Response.json({ error: 'Invalid status' }, { status: 400 });
    }
    await context.env.DB.prepare(
      "UPDATE orders SET status = ? WHERE id = ?"
    ).bind(status, id).run();
    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
