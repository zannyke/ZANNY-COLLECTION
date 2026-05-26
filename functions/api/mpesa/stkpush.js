export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const body = await request.json();
    const { orderId, amount, phone } = body;

    if (!orderId || !amount || !phone) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    // Format phone number to 2547XXXXXXXX
    let formattedPhone = phone.trim().replace(/\s/g, '');
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '254' + formattedPhone.slice(1);
    } else if (formattedPhone.startsWith('+')) {
      formattedPhone = formattedPhone.slice(1);
    }

    if (!/^254\d{9}$/.test(formattedPhone)) {
      return new Response(JSON.stringify({ error: 'Invalid Kenyan phone number format' }), { status: 400 });
    }

    const consumerKey = env.MPESA_CONSUMER_KEY;
    const consumerSecret = env.MPESA_CONSUMER_SECRET;
    const passkey = env.MPESA_PASSKEY;
    const shortcode = env.MPESA_SHORTCODE;
    const webhookSecret = env.MPESA_WEBHOOK_SECRET || 'fallback-secret-for-dev';
    const callbackUrl = env.MPESA_CALLBACK_URL || `https://${new URL(request.url).hostname}/api/mpesa/callback?secret=${webhookSecret}`;

    if (!consumerKey || !consumerSecret || !passkey || !shortcode) {
      // For sandbox testing, we allow fallback to Safaricom Sandbox default shortcode/passkey
      // However, we still need the consumer key/secret to generate a token
      return new Response(JSON.stringify({ error: 'M-Pesa API Keys are not configured on the server.' }), { status: 500 });
    }

    const mpesaBaseUrl = env.MPESA_ENV === 'production'
      ? 'https://api.safaricom.co.ke'
      : 'https://sandbox.safaricom.co.ke';

    // 1. Get OAuth Token
    const authString = btoa(`${consumerKey}:${consumerSecret}`);
    const tokenRes = await fetch(`${mpesaBaseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
      headers: {
        Authorization: `Basic ${authString}`
      }
    });

    if (!tokenRes.ok) {
      const errorText = await tokenRes.text();
      return new Response(JSON.stringify({ error: 'Failed to authenticate with M-Pesa', details: errorText }), { status: 500 });
    }

    const { access_token } = await tokenRes.json();

    // 2. Generate Password
    const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
    const password = btoa(`${shortcode}${passkey}${timestamp}`);

    // 3. Initiate STK Push
    const stkPayload = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerBuyGoodsOnline', // Correct type for M-Pesa Till Number / Buy Goods
      Amount: Math.ceil(amount),
      PartyA: formattedPhone,
      PartyB: shortcode,
      PhoneNumber: formattedPhone,
      CallBackURL: callbackUrl,
      AccountReference: `Order ${orderId}`,
      TransactionDesc: 'Payment for Zanny Collection'
    };

    const stkRes = await fetch(`${mpesaBaseUrl}/mpesa/stkpush/v1/processrequest`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(stkPayload)
    });

    const stkData = await stkRes.json();

    if (stkData.ResponseCode === '0') {
      // Save CheckoutRequestID to D1 Database
      const checkoutRequestId = stkData.CheckoutRequestID;
      
      await env.DB.prepare(
        'UPDATE orders SET mpesa_checkout_id = ?, mpesa_phone = ?, status = ? WHERE id = ?'
      ).bind(checkoutRequestId, formattedPhone, 'pending_payment', orderId).run();

      return new Response(JSON.stringify({ success: true, checkoutRequestId, message: 'STK push sent' }), { status: 200 });
    } else {
      return new Response(JSON.stringify({ error: stkData.errorMessage || 'STK Push Failed', details: stkData }), { status: 400 });
    }

  } catch (err) {
    return new Response(JSON.stringify({ error: 'Server error', details: err.message }), { status: 500 });
  }
}
