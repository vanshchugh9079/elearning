import emailjs from '@emailjs/browser';

const sendEmail = async ({ to, subject, text, html }) => {
  if (!to || !subject || (!text && !html)) {
    throw new Error("Missing required fields in sendEmail");
  }

  // Initialize EmailJS with your public key
  emailjs.init(process.env.EMAILJS_PUBLIC_KEY);

  const templateParams = {
    to_email: to,
    subject: subject,
    message: html || text,
    from_name: "E-Learning Platform",
    reply_to: process.env.EMAILJS_REPLY_TO || "no-reply@example.com"
  };

  try {
    const response = await emailjs.send(
      process.env.EMAILJS_SERVICE_ID,
      process.env.EMAILJS_TEMPLATE_ID,
      templateParams
    );
    
    console.log(`✅ Email sent to ${to}:`, response);
    return response;
  } catch (error) {
    console.error(`❌ Failed to send email to ${to}:`, error);
    throw new Error("Email could not be sent");
  }
};

export default sendEmail;