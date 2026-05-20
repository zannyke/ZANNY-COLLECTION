export async function onRequestPost(context) {
  try {
    const data = await context.request.json();
    
    // Hash password using WebCrypto
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data.password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const passwordHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    const userId = crypto.randomUUID();

    await context.env.DB.prepare(
      "INSERT INTO users (id, email, password_hash, first_name, last_name, role) VALUES (?, ?, ?, ?, ?, ?)"
    ).bind(userId, data.email, passwordHash, data.firstName, data.lastName, 'customer').run();

    return Response.json({ 
      success: true, 
      user: { id: userId, email: data.email, firstName: data.firstName, lastName: data.lastName, role: 'customer' } 
    });
  } catch (err) {
    if (err.message.includes('UNIQUE constraint failed')) {
      return Response.json({ success: false, message: 'Email already exists' }, { status: 400 });
    }
    return Response.json({ error: err.message }, { status: 500 });
  }
}
