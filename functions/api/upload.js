import { requireAdmin } from '../utils/auth.js';

export async function onRequestPost(context) {
  try {
    const auth = await requireAdmin(context);
    if (auth instanceof Response) return auth;

    const formData = await context.request.formData();
    const file = formData.get('file');

    if (!file) {
      return Response.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    // Generate a unique name for the file
    const uniqueId = crypto.randomUUID();
    const extension = file.name.split('.').pop() || 'png';
    const key = `products/${uniqueId}.${extension}`;

    // Upload to Cloudflare R2 Bucket securely
    await context.env.BUCKET.put(key, file.stream(), {
      httpMetadata: { contentType: file.type }
    });

    // Return the internal URL where the image can be accessed
    return Response.json({ success: true, url: `/api/images/${key}` });
  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
