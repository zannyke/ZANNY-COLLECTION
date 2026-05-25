export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const url = new URL(request.url);
    const secret = url.searchParams.get('secret');
    const expectedSecret = env.MPESA_WEBHOOK_SECRET || 'fallback-secret-for-dev';

    if (secret !== expectedSecret) {
      return new Response('Unauthorized', { status: 401 });
    }

    const body = await request.json();

    // Safaricom sends the payload inside Body.stkCallback
    const callbackData = body?.Body?.stkCallback;

    if (!callbackData) {
      return new Response('Invalid payload', { status: 400 });
    }

    const checkoutRequestId = callbackData.CheckoutRequestID;
    const resultCode = callbackData.ResultCode;

    if (resultCode === 0) {
      // Payment Successful
      // Extract M-Pesa Receipt Number
      const meta = callbackData.CallbackMetadata?.Item || [];
      const receiptObj = meta.find(item => item.Name === 'MpesaReceiptNumber');
      const receiptNumber = receiptObj ? receiptObj.Value : 'UNKNOWN';

      // Update Order Status in D1
      await env.DB.prepare(
        'UPDATE orders SET status = ?, mpesa_receipt = ? WHERE mpesa_checkout_id = ?'
      ).bind('paid', receiptNumber, checkoutRequestId).run();

    } else {
      // Payment Failed or Cancelled by User
      await env.DB.prepare(
        'UPDATE orders SET status = ? WHERE mpesa_checkout_id = ?'
      ).bind('payment_failed', checkoutRequestId).run();
    }

    // Safaricom requires a success response so they don't keep retrying
    return new Response(JSON.stringify({ ResultCode: 0, ResultDesc: "Accepted" }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error('M-Pesa Callback Error:', err);
    return new Response('Server error', { status: 500 });
  }
}
