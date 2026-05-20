export async function onRequestPost(context) {
  try {
    const data = await context.request.json();

    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data.password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const passwordHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    const user = await context.env.DB.prepare(
      "SELECT id, email, first_name, last_name, role FROM users WHERE email = ? AND password_hash = ?"
    ).bind(data.email, passwordHash).first();

    if (user) {
      return Response.json({ 
        success: true, 
        user: { id: user.id, email: user.email, firstName: user.first_name, lastName: user.last_name, role: user.role } 
      });
    } else {
      return Response.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
    }
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
