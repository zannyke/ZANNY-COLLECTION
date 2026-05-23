export async function onRequestGet(context) {
  try {
    const { request, env } = context;
    const url = new URL(request.url);
    const checkoutRequestId = url.searchParams.get('checkoutRequestId');

    if (!checkoutRequestId) {
      return new Response(JSON.stringify({ error: 'Missing checkoutRequestId' }), { status: 400 });
    }

    const { results } = await env.DB.prepare(
      'SELECT status, mpesa_receipt FROM orders WHERE mpesa_checkout_id = ?'
    ).bind(checkoutRequestId).all();

    if (!results || results.length === 0) {
      return new Response(JSON.stringify({ error: 'Order not found' }), { status: 404 });
    }

    const order = results[0];

    return new Response(JSON.stringify({ 
      status: order.status, 
      receipt: order.mpesa_receipt 
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (err) {
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
}
