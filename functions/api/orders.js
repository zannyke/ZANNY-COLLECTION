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

      // Increment sold count AND decrement stock in products table
      await context.env.DB.prepare(
        "UPDATE products SET sold = sold + ?, stock = MAX(0, stock - ?) WHERE id = ?"
      ).bind(item.qty, item.qty, item.id).run();
    }

    // Fetch user details for customer email
    const user = await context.env.DB.prepare("SELECT email, first_name FROM users WHERE id = ?").bind(data.userId).first();

    // Send email notification to Admin and Customer
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

        // Send Email to Customer
        if (user && user.email) {
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${context.env.RESEND_API_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              from: 'Zanny Collection <onboarding@resend.dev>',
              to: user.email,
              subject: `Order Confirmation - #${orderId}`,
              html: `
                <div style="font-family:sans-serif; padding: 20px;">
                  <h2>Hi ${user.first_name},</h2>
                  <p>Thank you for shopping with Zanny Collection! Your order <strong>#${orderId}</strong> has been received successfully.</p>
                  <p><strong>Total:</strong> KSh ${data.totalAmount.toLocaleString()}</p>
                  <p><strong>Delivery Address:</strong> ${data.shippingAddress}</p>
                  <h3>Items Ordered:</h3>
                  <ul>${itemsHtml}</ul>
                  <p>We will notify you when your order is shipped!</p>
                </div>
              `
            })
          });
        }
      } catch (emailErr) {
        console.error("Failed to send email notifications", emailErr);
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
    const { id, status, trackingNumber } = await context.request.json();
    const allowed = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!allowed.includes(status)) {
      return Response.json({ error: 'Invalid status' }, { status: 400 });
    }
    
    await context.env.DB.prepare(
      "UPDATE orders SET status = ? WHERE id = ?"
    ).bind(status, id).run();

    // Send Customer Email if shipped or delivered
    if (context.env.RESEND_API_KEY && (status === 'shipped' || status === 'delivered')) {
      try {
        const order = await context.env.DB.prepare(`
          SELECT o.*, u.email, u.first_name 
          FROM orders o JOIN users u ON o.user_id = u.id 
          WHERE o.id = ?
        `).bind(id).first();

        if (order && order.email) {
          let subject = '';
          let html = '';

          if (status === 'shipped') {
            subject = `Your Order #${id} has Shipped!`;
            html = `
              <div style="font-family:sans-serif; padding: 20px;">
                <h2>Great news, ${order.first_name}!</h2>
                <p>Your order <strong>#${id}</strong> has been handed over to our delivery partners and is on its way to you.</p>
                ${trackingNumber ? `<p><strong>Tracking Number / Link:</strong> ${trackingNumber}</p>` : ''}
                <p>If you have any questions, feel free to reply to this email.</p>
              </div>
            `;
          } else if (status === 'delivered') {
            subject = `Your Order #${id} has been Delivered!`;
            html = `
              <div style="font-family:sans-serif; padding: 20px;">
                <h2>Hi ${order.first_name},</h2>
                <p>Your order <strong>#${id}</strong> has been marked as delivered.</p>
                <p>We'd love to hear your thoughts! Please log into your account at <a href="https://zannycollection.com/account">Zanny Collection</a> to leave feedback on your purchase.</p>
                <p>Enjoy your gear!</p>
              </div>
            `;
          }

          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${context.env.RESEND_API_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              from: 'Zanny Collection <onboarding@resend.dev>',
              to: order.email,
              subject: subject,
              html: html
            })
          });
        }
      } catch (e) {
        console.error("Failed to send status update email", e);
      }
    }

    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
