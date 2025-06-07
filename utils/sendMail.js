import emailjs from '@emailjs/nodejs';

const sendEmail = async ({ to, subject, text, html,otp }) => {
  // Enhanced validation
  if (!to || typeof to !== 'string' || !to.includes('@')) {
    throw new Error('Valid recipient email is required');
  }

  const recipient = to.trim();
  console.log('Sending to:', recipient); // Debug log

  const templateParams = {
    // Try both common field names
    to_email: recipient,
    email: recipient, // Some templates use this
    user_email: recipient, // Another common variant
    
    subject: subject || 'No Subject',
    message: html || text || 'No content provided',
    from_name: "E-Learning Platform",
    passcode:otp,
    reply_to: process.env.EMAILJS_REPLY_TO || "no-reply@example.com"
  };

  try {
    console.log('Template Params:', templateParams); // Debug log
    console.log('Using Service ID:', process.env.EMAILJS_SERVICE_ID); // Debug log
    
    const response = await emailjs.send(
      process.env.EMAILJS_SERVICE_ID,
      process.env.EMAILJS_TEMPLATE_ID,
      templateParams,
      {
        publicKey: process.env.EMAILJS_PUBLIC_KEY,
        privateKey: process.env.EMAILJS_PRIVATE_KEY
      }
    );
    return response;
  } catch (error) {
    console.error('Full EmailJS Error:', JSON.stringify(error, null, 2));
    throw new Error(`Email failed to send: ${error.text}`);
  }
};

export default sendEmail;