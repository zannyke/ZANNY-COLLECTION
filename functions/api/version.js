import { requireAdmin } from '../utils/auth.js';

// GET /api/version - Public endpoint to retrieve active APK version info
export async function onRequestGet(context) {
  try {
    const res = await fetch('https://zanny-collection-api.zannykenya254.workers.dev/api/version');
    const data = await res.json();
    return Response.json(data);
  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}

// PUT /api/version - Admin-only endpoint to publish a new APK version
export async function onRequestPut(context) {
  try {
    const auth = await requireAdmin(context);
    if (auth instanceof Response) return auth;

    const payload = await context.request.json();
    const res = await fetch('https://zanny-collection-api.zannykenya254.workers.dev/api/version', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    // Read the response from the worker
    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      data = { message: text };
    }
    
    return Response.json(data, { status: res.status });
  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
