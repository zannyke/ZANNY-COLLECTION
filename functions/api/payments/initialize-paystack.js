import { getCurrentUser } from '../../../utils/auth.js';

// POST /api/payments/initialize-paystack
// Initializes a Paystack payment session for the logged-in user.
// Uses cookie-based session auth (zanny_session) — no Bearer token needed from browser.
// The PAYSTACK_SECRET_KEY never leaves the server side.
export async function onRequestPost(context) {
  try {
    const user = await getCurrentUser(context);
    if (!user) {
      return Response.json({ error: 'Unauthorized: You must be logged in to checkout.' }, { status: 401 });
    }

    if (!context.env.PAYSTACK_SECRET_KEY) {
      return Response.json({ error: 'Online payment gateway is not configured. Please use Pay on Delivery or contact support.' }, { status: 500 });
    }

    const data = await context.request.json().catch(() => ({}));
    const { items, total_amount, delivery_address, recipient_name, recipient_phone } = data;

    // ── Server-side validation ────────────────────────────────────────────────
    if (!Array.isArray(items) || items.length === 0) {
      return Response.json({ error: 'Order items are required and must not be empty.' }, { status: 400 });
    }
    if (typeof total_amount !== 'number' || total_amount <= 0) {
      return Response.json({ error: 'Total amount must be a positive number.' }, { status: 400 });
    }
    const cleanAddress = (delivery_address || '').trim();
    if (cleanAddress.length < 5 || cleanAddress.length > 250) {
      return Response.json({ error: 'Please enter a valid delivery address (5–250 characters).' }, { status: 400 });
    }
    const cleanName = (recipient_name || '').trim();
    if (cleanName.length < 2 || cleanName.length > 50) {
      return Response.json({ error: 'Please enter a valid recipient name (2–50 characters).' }, { status: 400 });
    }
    const cleanPhone = (recipient_phone || '').replace(/\s+/g, '');
    const phoneRegex = /^\+?[0-9]{9,15}$/;
    if (!phoneRegex.test(cleanPhone)) {
      return Response.json({ error: 'Please enter a valid phone number (9–15 digits).' }, { status: 400 });
    }

    // ── Fetch user email for Paystack ─────────────────────────────────────────
    const dbUser = await context.env.DB.prepare(
      'SELECT email FROM users WHERE id = ?'
    ).bind(user.id).first();
    const customerEmail = dbUser?.email || 'customer@zannycollection.com';

    // ── Build order ID and reference ──────────────────────────────────────────
    // NOTE: The order is NOT inserted here. It is inserted by the Paystack webhook
    // (on the Cloudflare Worker) AFTER successful payment — preventing ghost orders.
    const tempOrderId = 'ORD-' + String(Date.now()).slice(-6);
    const reference = `zanny_direct_${tempOrderId}_${Date.now()}`;
    const origin = new URL(context.request.url).origin;

    const paystackPayload = {
      email: customerEmail,
      amount: Math.round(total_amount * 100), // Paystack requires amount in kobo (1 KES = 100 kobo)
      currency: 'KES',
      reference: reference,
      callback_url: `${origin}/orders?id=${tempOrderId}&payment=success`,
      metadata: {
        temp_order_id: tempOrderId,
        user_id: user.id,
        items: JSON.stringify(items),           // Full cart snapshot for webhook
        total_amount: total_amount,
        delivery_address: cleanAddress,
        recipient_name: cleanName,
        recipient_phone: cleanPhone,
        is_direct: true                          // Signals to webhook: insert order on success
      }
    };

    // ── Call Paystack transaction/initialize ──────────────────────────────────
    const paystackRes = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${context.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(paystackPayload)
    });

    const respData = await paystackRes.json();

    if (!paystackRes.ok || !respData.status) {
      console.error('Paystack API error:', JSON.stringify(respData));
      return Response.json(
        { error: respData.message || 'Failed to initialize payment. Please try again.' },
        { status: 400 }
      );
    }

    return Response.json({
      url: respData.data.authorization_url,  // Redirect user to this URL
      reference: reference,
      tempOrderId: tempOrderId
    });

  } catch (err) {
    console.error('Paystack initialize-paystack error:', err);
    return Response.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
