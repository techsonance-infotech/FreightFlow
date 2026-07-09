'use server';

import { sendEmail } from '@/lib/email';

export async function submitContactForm(formData: { name: string; email: string; subject: string; message: string }) {
  const { name, email, subject, message } = formData;

  if (!name || !email || !subject || !message) {
    return { error: 'All fields are required.' };
  }

  // Validate email format
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: 'Please enter a valid email address.' };
  }

  try {
    const supportEmail = process.env.SUPPORT_EMAIL || 'support@techsonance.co.in';
    
    // Send email to support
    await sendEmail({
      to: supportEmail,
      subject: `[Contact Form] ${subject} - ${name}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color: #3b82f6; border-bottom: 1px solid #eee; padding-bottom: 10px;">New Contact Inquiry</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <div style="margin-top: 20px; padding: 15px; background-color: #f9f9f9; border-radius: 4px; border-left: 4px solid #3b82f6;">
            <p style="white-space: pre-wrap; margin: 0;">${message}</p>
          </div>
        </div>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error('Contact form submission failed:', error);
    return { error: 'Failed to send message. Please try again later or reach out directly via email.' };
  }
}
