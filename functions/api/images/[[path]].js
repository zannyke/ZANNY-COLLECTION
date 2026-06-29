export async function onRequestGet(context) {
  try {
    const pathParams = context.params.path;
    
    // 1. Prevent path traversal by thoroughly validating each component
    for (const part of pathParams) {
      let decodedPart = part;
      try {
        // Decode up to 3 times to exhaustively handle double/triple url encoding bypasses
        decodedPart = decodeURIComponent(decodeURIComponent(decodeURIComponent(part)));
      } catch (e) {
        // Ignore decoding errors
      }
      
      const normalized = decodedPart.trim().toLowerCase();
      
      // Block directory traversal signatures, slashes, backslashes, and null bytes
      if (
        normalized === '..' ||
        normalized === '.' ||
        normalized.includes('..') ||
        normalized.includes('/') ||
        normalized.includes('\\') ||
        normalized.includes('\0') ||
        normalized.includes('%2f') ||
        normalized.includes('%2e') ||
        normalized.includes('%00')
      ) {
        return new Response('Access denied: Invalid path component', { status: 400 });
      }
    }

    const path = pathParams.join('/');

    // 2. Allowlist top-level directories to lock down bucket access
    const ALLOWED_DIRECTORIES = ['products', 'styles', 'zanny-images'];
    const firstComponent = pathParams[0];

    if (!ALLOWED_DIRECTORIES.includes(firstComponent)) {
      return new Response('Access denied: Unauthorized directory', { status: 403 });
    }
    
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
