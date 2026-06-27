import { requireAdmin } from '../utils/auth.js';

// POST /api/upload-apk - Admin-only APK upload proxy
export async function onRequestPost(context) {
  try {
    const auth = await requireAdmin(context);
    if (auth instanceof Response) return auth;

    const formData = await context.request.formData();
    const file = formData.get('file');

    if (!file) {
      return Response.json({ success: false, error: 'No APK file provided' }, { status: 400 });
    }

    // Forward multipart form-data to worker upload API
    const workerFormData = new FormData();
    workerFormData.append('file', file);

    const res = await fetch('https://zanny-collection-api.zannykenya254.workers.dev/api/upload', {
      method: 'POST',
      body: workerFormData
    });

    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      // If the response is a plain URL string, wrap it in a success object
      if (text.startsWith('http://') || text.startsWith('https://')) {
        data = { success: true, url: text };
      } else {
        data = { url: text };
      }
    }

    return Response.json(data, { status: res.status });
  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
