export async function onRequestPost(context) {
  try {
    const data = await context.request.json();
    const { firstName, lastName, email, message } = data;

    if (!firstName || !lastName || !email || !message) {
      return Response.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (!context.env.RESEND_API_KEY) {
      return Response.json({ error: 'Email service not configured' }, { status: 500 });
    }

    const htmlBody = `
      <div style="font-family: sans-serif; padding: 20px;">
        <h2>New Contact Form Submission</h2>
        <p><strong>From:</strong> ${firstName} ${lastName} (${email})</p>
        <div style="margin-top: 20px; padding: 15px; border-left: 4px solid #1a1a1a; background: #f9f9f9;">
          ${(message || '').replace(/<[^>]*>?/gm, '').replace(/\n/g, '<br>')}
        </div>
      </div>
    `;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${context.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Zanny Collection Contact <onboarding@resend.dev>',
        to: 'zannykenya254@gmail.com',
        subject: `Contact Request: ${firstName} ${lastName}`,
        html: htmlBody,
        reply_to: email
      })
    });

    if (!res.ok) {
      const errTxt = await res.text();
      console.error('Resend Error:', errTxt);
      throw new Error('Failed to send email');
    }

    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
