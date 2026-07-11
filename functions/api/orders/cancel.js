// functions/api/orders/cancel.js
import { getCurrentUser } from '../../utils/auth.js';
import { sendNotificationToUser } from '../../utils/fcm.js';

export async function onRequestPost(context) {
  try {
    const user = await getCurrentUser(context);
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { orderId } = await context.request.json().catch(() => ({}));
    if (!orderId) {
      return Response.json({ error: 'Order ID is required.' }, { status: 400 });
    }

    const db = context.env.DB;

    // Fetch the order
    const order = await db.prepare('SELECT * FROM orders WHERE id = ?').bind(orderId).first();
    if (!order) {
      return Response.json({ error: 'Order not found.' }, { status: 404 });
    }

    // Verify ownership
    if (order.user_id !== user.id) {
      return Response.json({ error: 'Unauthorized.' }, { status: 403 });
    }

    // Check status
    if (order.status === 'pending' || order.status === 'confirmed') {
      // 1. Cancellation Policy
      
      // If paid online via Paystack, trigger refund using the DB's total_amount (security source of truth!)
      if (order.paystack_reference) {
        if (!context.env.PAYSTACK_SECRET_KEY) {
          return Response.json({ error: 'Gateway refund key not configured.' }, { status: 500 });
        }
        
        const refundPayload = {
          transaction: order.paystack_reference,
          amount: Math.round(order.total_amount * 100)
        };

        const res = await fetch('https://api.paystack.co/refund', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${context.env.PAYSTACK_SECRET_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(refundPayload)
        });

        const refundData = await res.json();
        if (!res.ok && refundData.message !== 'Transaction has already been fully refunded') {
          return Response.json({ error: refundData.message || 'Refund failed' }, { status: 400 });
        }
      }

      // Update status in DB to cancelled
      await db.prepare("UPDATE orders SET status = 'cancelled' WHERE id = ?").bind(orderId).run();

      // Enforce COD restriction if user has 3 consecutive COD cancellations
      if (order.payment_method === 'cod') {
        const userOrders = await db.prepare(
          "SELECT payment_method, status FROM orders WHERE user_id = ? ORDER BY created_at DESC LIMIT 3"
        ).bind(user.id).all();

        const codCancellations = userOrders.results.filter(
          o => o.payment_method === 'cod' && o.status === 'cancelled'
        ).length;

        if (codCancellations >= 3) {
          await db.prepare(
            "UPDATE users SET restricted_from_cod = 1 WHERE id = ?"
          ).bind(user.id).run();
        }
      }

      // Send FCM notification
      await sendNotificationToUser(context, order.user_id, 'Order Cancelled', `Your order #${orderId} has been successfully cancelled.`, '/orders');

      // Notify admins
      const adminUsers = await db.prepare(
        "SELECT id FROM users WHERE is_admin = 1 OR email = 'admin@zannycollection.com'"
      ).all();
      for (const admin of adminUsers.results || []) {
        await sendNotificationToUser(context, admin.id, '❌ Order Cancelled', `Customer cancelled order #${orderId} for KES ${order.total_amount}.`, '/orders').catch(() => {});
      }

      // Send email to admin notifying about cancellation via Resend
      if (context.env.RESEND_API_KEY) {
        const adminEmail = 'zannykenya254@gmail.com';
        const subject = `Order Cancelled: #${orderId}`;
        const html = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 12px; background-color: #fafafa;">
            <h2 style="color: #c62828; border-bottom: 2px solid #c62828; padding-bottom: 10px;">Order Cancelled & Refunded</h2>
            <p>Order <strong>#${orderId}</strong> has been cancelled by the customer.</p>
            <div style="background-color: #ffffff; padding: 15px; border-radius: 8px; border: 1px solid #ddd; margin: 20px 0;">
              <p><strong>Order ID:</strong> ${orderId}</p>
              <p><strong>Customer:</strong> ${user.email}</p>
              <p><strong>Refund Amount:</strong> KES ${order.total_amount}</p>
              ${order.paystack_reference ? `<p><strong>Paystack Refund Ref:</strong> ${order.paystack_reference}</p>` : '<p><strong>Method:</strong> Cash on Delivery (No online refund needed)</p>'}
            </div>
          </div>
        `;

        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${context.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'Zanny Collection <onboarding@resend.dev>',
            to: adminEmail,
            subject: subject,
            html: html
          })
        }).catch(() => {});
      }

      return Response.json({ success: true, message: 'Order cancelled successfully.' });

    } else if (order.status === 'delivered') {
      // 2. Returns Policy (Delivered orders within 2 days / 48 hours)
      if (!order.delivered_at) {
        return Response.json({ error: 'Order delivery date is missing.' }, { status: 400 });
      }

      const deliveredAt = new Date(order.delivered_at).getTime();
      if (isNaN(deliveredAt) || (Date.now() - deliveredAt > 2 * 24 * 60 * 60 * 1000)) {
        return Response.json({ error: 'Returns are only allowed within 2 days of delivery.' }, { status: 400 });
      }

      // Update status to return_pending
      await db.prepare("UPDATE orders SET status = 'return_pending' WHERE id = ?").bind(orderId).run();

      // Send FCM notification to user
      await sendNotificationToUser(context, order.user_id, 'Return Initiated', `Your return request for Order #${orderId} has been received. Returns take up to 5 days to process.`, '/orders');

      // Notify admins
      const adminUsers = await db.prepare(
        "SELECT id FROM users WHERE is_admin = 1 OR email = 'admin@zannycollection.com'"
      ).all();
      for (const admin of adminUsers.results || []) {
        await sendNotificationToUser(context, admin.id, '📦 Return Requested', `Customer requested a return for Order #${orderId}.`, '/orders').catch(() => {});
      }

      // Send email to admin notifying about return request
      if (context.env.RESEND_API_KEY) {
        const adminEmail = 'zannykenya254@gmail.com';
        const subject = `Return Requested: #${orderId}`;
        const html = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 12px; background-color: #fafafa;">
            <h2 style="color: #ef6c00; border-bottom: 2px solid #ef6c00; padding-bottom: 10px;">Return Requested</h2>
            <p>Customer has requested a return for order <strong>#${orderId}</strong> within the 48-hour delivery policy.</p>
            <div style="background-color: #ffffff; padding: 15px; border-radius: 8px; border: 1px solid #ddd; margin: 20px 0;">
              <p><strong>Order ID:</strong> ${orderId}</p>
              <p><strong>Customer:</strong> ${user.email}</p>
              <p><strong>Total Amount:</strong> KES ${order.total_amount}</p>
              <p><strong>Delivered At:</strong> ${order.delivered_at}</p>
            </div>
            <p>Please review and verify the return. Returns take up to 5 days to verify and refund.</p>
          </div>
        `;

        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${context.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'Zanny Collection <onboarding@resend.dev>',
            to: adminEmail,
            subject: subject,
            html: html
          })
        }).catch(() => {});
      }

      return Response.json({ success: true, message: 'Return initiated successfully. It takes up to 5 days to verify.' });

    } else {
      return Response.json({ error: `Cannot cancel or return order in ${order.status} state.` }, { status: 400 });
    }

  } catch (err) {
    console.error('Cancel order error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
