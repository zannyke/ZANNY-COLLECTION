export async function onRequestGet(context) {
  try {
    // Get the exact file path requested from the URL (e.g., "products/123.png")
    const path = context.params.path.join('/');
    
    // Fetch from Cloudflare R2 securely
    const object = await context.env.BUCKET.get(path);

    if (!object) {
      return new Response('Image not found', { status: 404 });
    }

    // Set proper headers to display the image fast and cache it
    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    headers.set('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year

    return new Response(object.body, { headers });
  } catch (err) {
    return new Response(err.message, { status: 500 });
  }
}
