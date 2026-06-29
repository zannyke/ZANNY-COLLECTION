export async function onRequest(context) {
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
  
  return context.next();
}
