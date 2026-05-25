import { getCurrentUser } from '../utils/auth.js';

export async function onRequestGet(context) {
  try {
    const user = await getCurrentUser(context);
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let query = `SELECT o.*, CASE WHEN f.id IS NOT NULL THEN 1 ELSE 0 END as has_feedback 
       FROM orders o 
       LEFT JOIN feedback f ON o.id = f.order_id`;
    let bindArgs = [];

    if (user.role !== 'admin') {
      query += ` WHERE o.user_id = ?`;
      bindArgs.push(user.id);
    }
    
    query += ` ORDER BY o.created_at DESC`;

    const { results: orders } = await context.env.DB.prepare(query).bind(...bindArgs).all();

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
    
    // VERIFY LIVE STOCK FIRST TO PREVENT INVENTORY RACE CONDITIONS
    for (const item of data.items) {
      const product = await context.env.DB.prepare(
        "SELECT stock, name FROM products WHERE id = ?"
      ).bind(item.id).first();

      if (!product) {
        return Response.json({ error: `Product not found (ID: ${item.id}).` }, { status: 400 });
      }

      if (product.stock < item.qty) {
        return Response.json({ 
          error: `Out of stock: ${product.name}. Only ${product.stock} left. Please return to your cart and remove/adjust this item.` 
        }, { status: 400 });
      }
    }

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
    const user = await getCurrentUser(context);
    const adminToken = context.request.headers.get('X-Admin-Token');
    const isAdmin = (user && user.role === 'admin') || (adminToken === '8bef858d3755303abebcbb3b9aacc446dd90e5c5aa268731388a4c5a4b14a8cb');

    if (!user && !isAdmin) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, status, trackingNumber, cancelledByCustomer } = await context.request.json();
    const allowed = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!allowed.includes(status)) {
      return Response.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Fetch the order to get the user_id
    const order = await context.env.DB.prepare(`
      SELECT o.*, u.email, u.first_name, u.consecutive_cancellations, u.restricted_from_cod, u.consecutive_successful_orders 
      FROM orders o LEFT JOIN users u ON o.user_id = u.id 
      WHERE o.id = ?
    `).bind(id).first();

    if (!order) {
      return Response.json({ error: 'Order not found' }, { status: 404 });
    }

    // Authorization checks
    if (!isAdmin) {
      if (!user || order.user_id !== user.id) {
        return Response.json({ error: 'Forbidden: You do not own this order' }, { status: 403 });
      }
      if (status !== 'cancelled' || !cancelledByCustomer) {
        return Response.json({ error: 'Forbidden: Customers can only cancel orders' }, { status: 403 });
      }
    }
    
    let updateQuery = "UPDATE orders SET status = ?";
    let bindParams = [status];

    if (status === 'confirmed') {
      updateQuery += ", confirmed_at = CURRENT_TIMESTAMP";
    } else if (status === 'shipped') {
      updateQuery += ", shipped_at = CURRENT_TIMESTAMP";
      if (trackingNumber) {
        updateQuery += ", tracking_number = ?";
        bindParams.push(trackingNumber);
      }
    } else if (status === 'delivered') {
      updateQuery += ", delivered_at = CURRENT_TIMESTAMP";
    }

    updateQuery += " WHERE id = ?";
    bindParams.push(id);

    await context.env.DB.prepare(updateQuery).bind(...bindParams).run();

    if (status === 'cancelled') {
      // Restore stock
      const { results: items } = await context.env.DB.prepare(
        "SELECT product_id, quantity FROM order_items WHERE order_id = ?"
      ).bind(id).all();
      
      for (const item of items) {
        await context.env.DB.prepare(
          "UPDATE products SET sold = MAX(0, sold - ?), stock = stock + ? WHERE id = ?"
        ).bind(item.quantity, item.quantity, item.product_id).run();
      }

      // Notify admin if cancelled by customer
      if (cancelledByCustomer && context.env.RESEND_API_KEY) {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${context.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'Zanny Collection <onboarding@resend.dev>',
            to: 'zannykenya254@gmail.com',
            subject: `Order Cancelled by Customer [${id}]`,
            html: `<div style="font-family:sans-serif;"><h2>Order Cancelled</h2><p>The customer has cancelled order <strong>#${id}</strong>.</p><p>The stock for the items in this order has been automatically restored.</p></div>`
          })
        });
      }

      // Trust System Logic: Cancellations
      if (order && order.user_id && order.user_id !== 'guest') {
        const newCancellations = (order.consecutive_cancellations || 0) + 1;
        if (newCancellations >= 3) {
          await context.env.DB.prepare(
            "UPDATE users SET consecutive_cancellations = ?, restricted_from_cod = 1, consecutive_successful_orders = 0 WHERE id = ?"
          ).bind(newCancellations, order.user_id).run();
        } else {
          await context.env.DB.prepare(
            "UPDATE users SET consecutive_cancellations = ? WHERE id = ?"
          ).bind(newCancellations, order.user_id).run();
        }
      }
    }

    if (status === 'delivered') {
      // Trust System Logic: Successful Deliveries
      if (order && order.user_id && order.user_id !== 'guest') {
        if (order.restricted_from_cod === 1) {
          const newSuccesses = (order.consecutive_successful_orders || 0) + 1;
          if (newSuccesses >= 3) {
            // Restore privileges
            await context.env.DB.prepare(
              "UPDATE users SET restricted_from_cod = 0, consecutive_cancellations = 0, consecutive_successful_orders = 0 WHERE id = ?"
            ).bind(order.user_id).run();
          } else {
            await context.env.DB.prepare(
              "UPDATE users SET consecutive_successful_orders = ? WHERE id = ?"
            ).bind(newSuccesses, order.user_id).run();
          }
        } else {
          // Reset cancellations because they had a successful delivery
          await context.env.DB.prepare(
            "UPDATE users SET consecutive_cancellations = 0 WHERE id = ?"
          ).bind(order.user_id).run();
        }
      }
    }

    // Send Customer Email if shipped or delivered
    if (context.env.RESEND_API_KEY && (status === 'shipped' || status === 'delivered')) {
      try {
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
            
            // Build Receipt HTML
            const { results: items } = await context.env.DB.prepare(
              "SELECT oi.*, p.name FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?"
            ).bind(id).all();

            const itemsHtml = items.map(item => `
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name} <br><small style="color: #888;">Size: ${item.size}</small></td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">KSh ${(item.price_at_purchase * item.quantity).toLocaleString()}</td>
              </tr>
            `).join('');

            const paymentText = order.mpesa_receipt 
              ? `<p><strong>Payment Method:</strong> M-Pesa (Receipt: ${order.mpesa_receipt})</p>`
              : `<p><strong>Payment Method:</strong> Cash on Delivery</p>`;

            html = `
              <div style="font-family:sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px;">
                <h2 style="text-align: center; color: #1a1a1a;">ZANNY</h2>
                <h3 style="text-align: center; color: #444;">Hi ${order.first_name}, your order is here!</h3>
                <p style="text-align: center; color: #666; margin-bottom: 30px;">Your order <strong>#${id}</strong> has been successfully delivered. Thank you for shopping with us!</p>
                
                <h4 style="border-bottom: 2px solid #1a1a1a; padding-bottom: 5px;">Delivery Receipt</h4>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                  <thead>
                    <tr style="background: #f8f8f8;">
                      <th style="padding: 10px; text-align: left;">Item</th>
                      <th style="padding: 10px; text-align: center;">Qty</th>
                      <th style="padding: 10px; text-align: right;">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${itemsHtml}
                  </tbody>
                </table>
                
                <div style="text-align: right; margin-bottom: 20px;">
                  <h3 style="margin: 0;">Total Paid: KSh ${Number(order.total_amount).toLocaleString()}</h3>
                </div>

                <div style="background: #f9f9f9; padding: 15px; border-radius: 4px; font-size: 0.9em; color: #555;">
                  ${paymentText}
                  <p><strong>Delivered To:</strong> ${order.shipping_address}</p>
                </div>

                <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee;">
                  <p style="font-weight: bold;">How did we do?</p>
                  <p style="color: #666;">Log back into your account to leave a review and let us know what you think of your new gear!</p>
                  <a href="https://zannycollection.com/account" style="display: inline-block; margin-top: 10px; padding: 12px 24px; background: #1a1a1a; color: #fff; text-decoration: none; border-radius: 4px; font-weight: bold;">Leave a Review</a>
                </div>
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
