import emailjs from '@emailjs/nodejs';

const sendEmail = async ({ to, subject, text, html }) => {
  // Validate required fields
  if (!to || !to.includes('@')) {
    throw new Error('Valid recipient email is required');
  }
  console.log(to)
  console.log(subject)
  console.log(text)
  console.log(html);
  
  const templateParams = {
    to_email: to.trim(),  // 👈 Critical field name
    subject: subject || 'No Subject',
    message: html || text || 'No content provided',
    from_name: "E-Learning Platform",
    reply_to: process.env.EMAILJS_REPLY_TO || "no-reply@example.com"
  };

  try {
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
    console.error('EmailJS Error Details:', error);
    throw new Error(`Email failed to send: ${error.text}`);
  }
};
export default sendEmail