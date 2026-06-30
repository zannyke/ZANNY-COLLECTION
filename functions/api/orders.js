import { getCurrentUser } from '../utils/auth.js';

// GET /api/orders - Fetch orders (all for admin, user-specific for customers)
export async function onRequestGet(context) {
  try {
    const user = await getCurrentUser(context);
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let query = `
      SELECT 
        o.*, 
        u.email as customer_email, 
        u.first_name as customer_name,
        CASE WHEN f.id IS NOT NULL THEN 1 ELSE 0 END as has_feedback 
      FROM orders o 
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN feedback f ON o.id = f.order_id
    `;
    let bindArgs = [];

    if (user.role !== 'admin') {
      query += ` WHERE o.user_id = ?`;
      bindArgs.push(user.id);
    }
    
    query += ` ORDER BY o.created_at DESC`;

    const { results: orders } = await context.env.DB.prepare(query).bind(...bindArgs).all();

    // Map and enrich each order from its JSON items list
    const enriched = orders.map((order) => {
      let parsedItems = [];
      try {
        if (order.items) {
          const rawItems = JSON.parse(order.items);
          if (Array.isArray(rawItems)) {
            parsedItems = rawItems.map(item => ({
              product_id: item.product?.id || '',
              product_name: item.product?.name || '',
              image_url: item.product?.images?.[0] || item.product?.image_url || '',
              quantity: item.quantity || 1,
              size: item.selected_size || '',
              color: item.selected_color || '',
              price_at_purchase: item.product?.price || 0
            }));
          }
        }
      } catch (e) {
        console.error("Failed to parse items for order " + order.id, e);
      }

      return { 
        ...order, 
        items: parsedItems
      };
    });

    return Response.json(enriched);
  } catch (err) {
    console.error(err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/orders - Create a new order
export async function onRequestPost(context) {
  try {
    const user = await getCurrentUser(context);
    if (!user) {
      return Response.json({ error: 'Unauthorized: You must have an account and be logged in to place an order.' }, { status: 401 });
    }

    const data = await context.request.json();

    // Check if user is restricted from Cash on Delivery (COD)
    const userRecord = await context.env.DB.prepare(
      "SELECT restricted_from_cod FROM users WHERE id = ?"
    ).bind(user.id).first();

    if (userRecord && userRecord.restricted_from_cod === 1 && data.status === 'pending') {
      return Response.json({ error: 'Pay on Delivery is temporarily disabled for your account. Please pay upfront via M-Pesa.' }, { status: 400 });
    }
    
    // VERIFY LIVE STOCK FIRST AND FETCH DETAILS TO SERIALIZE
    const serializedItemsArray = [];
    for (const item of data.items) {
      const product = await context.env.DB.prepare(
        "SELECT * FROM products WHERE id = ?"
      ).bind(item.id).first();

      if (!product) {
        return Response.json({ error: `Product not found (ID: ${item.id}).` }, { status: 400 });
      }

      const isPreorder = product.is_preorder === 1;

      if (!isPreorder && product.stock < item.qty) {
        return Response.json({ 
          error: `Out of stock: ${product.name}. Only ${product.stock} left. Please return to your cart and remove/adjust this item.` 
        }, { status: 400 });
      }

      // Parse JSON fields from products table for full product description
      let images = [];
      try { if (product.images) images = JSON.parse(product.images); } catch (e) { console.warn("Failed to parse product images:", e); }
      if (images.length === 0 && product.image_url) {
        images = [product.image_url];
      }
      
      let colors = [];
      try { if (product.colors) colors = JSON.parse(product.colors); } catch (e) { console.warn("Failed to parse product colors:", e); }
      
      let sizes = [];
      try { if (product.sizes) sizes = JSON.parse(product.sizes); } catch (e) { console.warn("Failed to parse product sizes:", e); }

      serializedItemsArray.push({
        product: {
          id: product.id,
          name: product.name,
          subtitle: product.subtitle || '',
          description: product.description || '',
          price: product.price,
          original_price: product.original_price,
          images: images,
          colors: colors,
          sizes: sizes,
          category: product.category || product.category_slug || '',
          is_new: product.is_new === 1,
          is_sale: product.is_sale === 1,
          stock: product.stock,
          is_preorder: isPreorder
        },
        selected_color: item.color || '',
        selected_size: item.size || '',
        quantity: item.qty
      });
    }

    // Generate order ID
    const orderId = 'ORD-' + Date.now().toString().slice(-6);
    const itemsJson = JSON.stringify(serializedItemsArray);
    const recipientName = data.recipientName || (user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '');
    const recipientPhone = data.phoneNumber || '';
    const deliveryAddress = data.shippingAddress || '';
    const shippingAddress = data.shippingAddress || '';
    
    // Insert into orders table
    const orderStmt = context.env.DB.prepare(
      `INSERT INTO orders (
        id, user_id, items, total_amount, status, 
        delivery_address, shipping_address, 
        recipient_name, recipient_phone, phone_number
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      orderId, 
      user.id, // SECURE: Bind session user ID
      itemsJson,
      data.totalAmount, 
      data.status || 'pending',
      deliveryAddress,
      shippingAddress,
      recipientName,
      recipientPhone,
      data.phoneNumber
    );
    
    await orderStmt.run();

    // Decrement stock (for standard items only) and increment sold count in products table
    for (const item of serializedItemsArray) {
      if (item.product.is_preorder) {
        // Pre-order item: do NOT decrement stock, only increment sold count
        await context.env.DB.prepare(
          "UPDATE products SET sold = sold + ? WHERE id = ?"
        ).bind(item.quantity, item.product.id).run();
      } else {
        // Standard item: decrement stock and increment sold count
        await context.env.DB.prepare(
          "UPDATE products SET sold = sold + ?, stock = MAX(0, stock - ?) WHERE id = ?"
        ).bind(item.quantity, item.quantity, item.product.id).run();
      }
    }

    // Fetch user details for customer email
    const dbUser = await context.env.DB.prepare("SELECT email, first_name FROM users WHERE id = ?").bind(user.id).first();

    // Send email notification to Admin and Customer
    if (context.env.RESEND_API_KEY) {
      try {
        const itemsHtml = serializedItemsArray.map(item => `<li>${item.quantity}x ${item.product.name} (Size: ${item.selected_size}) - KSh ${item.product.price.toLocaleString()}</li>`).join('');
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
        if (dbUser && dbUser.email) {
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${context.env.RESEND_API_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              from: 'Zanny Collection <onboarding@resend.dev>',
              to: dbUser.email,
              subject: `Order Confirmation - #${orderId}`,
              html: `
                <div style="font-family:sans-serif; padding: 20px;">
                  <h2>Hi ${dbUser.first_name || 'Customer'},</h2>
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
    const isAdmin = user && user.role === 'admin';

    if (!user && !isAdmin) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, status, trackingNumber, cancelledByCustomer } = await context.request.json();
    const allowed = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!allowed.includes(status)) {
      return Response.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Fetch the order details
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
      // Restore stock from JSON items column
      let items = [];
      try {
        if (order.items) {
          items = JSON.parse(order.items);
        }
      } catch (e) {
        console.error("Failed to parse items for cancellation stock restore", e);
      }
      
      for (const item of items) {
        const productId = item.product?.id || item.product_id;
        const quantity = item.quantity || item.qty || 1;
        if (productId) {
          await context.env.DB.prepare(
            "UPDATE products SET sold = MAX(0, sold - ?), stock = stock + ? WHERE id = ?"
          ).bind(quantity, quantity, productId).run();
        }
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
            
            // Build Receipt HTML from JSON items list
            let items = [];
            try {
              if (order.items) {
                items = JSON.parse(order.items);
              }
            } catch (e) {
              console.error("Failed to parse items for delivered email receipt", e);
            }

            const itemsHtml = items.map(item => {
              const name = item.product?.name || '';
              const size = item.selected_size || '';
              const qty = item.quantity || 1;
              const price = item.product?.price || 0;
              return `
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #eee;">${name} <br><small style="color: #888;">Size: ${size}</small></td>
                  <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${qty}</td>
                  <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">KSh ${(price * qty).toLocaleString()}</td>
                </tr>
              `;
            }).join('');

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
    console.error(err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
