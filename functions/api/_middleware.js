export async function onRequest(context) {
  const allowedOrigins = [
    'https://zannycollection.com',
    'https://www.zannycollection.com',
    'http://localhost:5173',
    'http://localhost:3000'
  ];
  
  const origin = context.request.headers.get('Origin');
  const isAllowed = origin && (allowedOrigins.includes(origin) || origin.endsWith('.pages.dev'));

  // Handle preflight OPTIONS request
  if (context.request.method === 'OPTIONS') {
    if (origin && !isAllowed) {
      return new Response('CORS Blocked', { status: 403 });
    }
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': origin || '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Max-Age': '86400',
      }
    });
  }

  try {
    const clientIp = context.request.headers.get('CF-Connecting-IP');
    if (clientIp) {
      // Check if the IP is blacklisted in D1
      const isBlocked = await context.env.DB.prepare(
        "SELECT 1 FROM blacklisted_ips WHERE ip_address = ?"
      ).bind(clientIp).first();
      
      if (isBlocked) {
        return new Response('Access denied: Your IP address has been blocked by the administrator.', { status: 403 });
      }
    }
  } catch (err) {
    // Fail-open: ignore database issues so users aren't locked out during downtime
  }
  
  const response = await context.next();
  
  if (origin && isAllowed) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  } else if (origin) {
    // Block response headers for unauthorized origins
    return new Response('CORS Origin Not Allowed', { status: 403 });
  }

  return response;
}
