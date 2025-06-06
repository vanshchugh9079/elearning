import nodemailer from "nodemailer";

const sendEmail = async ({ to, subject, text, html }) => {
  if (!to || !subject || (!text && !html)) {
    throw new Error("Missing required fields in sendEmail");
  }

  // Create transporter with Gmail
  const transporter = nodemailer.createTransport({
    service: "gmail", // Use 'service' instead of host/port for better compatibility
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Prepare email content with anti-spam measures
  const mailOptions = {
    from: `"E-Learning Platform" <${process.env.EMAIL_USER}>`, // Consistent sender name
    to: Array.isArray(to) ? to.join(", ") : to,
    replyTo: process.env.EMAIL_USER, // Explicit reply-to address
    subject: subject.replace(/[^\w\s]/gi, ''), // Remove special chars from subject
    text: text || (html ? html.replace(/<[^>]*>/g, '') : ''), // Ensure plain text alternative
    html: html || undefined,
    headers: {
      "X-Priority": "3",
      "X-MSMail-Priority": "Normal",
      "Importance": "Normal",
      "List-Unsubscribe": `<mailto:${process.env.EMAIL_USER}?subject=Unsubscribe>`,
    },
    // Important for Gmail
    dsn: {
      id: `${Date.now()}`,
    },
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${to}: ${info.response}`);
    return info;
  } catch (error) {
    console.error(`❌ Failed to send email to ${to}: ${error.message}`);
    throw new Error("Email could not be sent");
  }
};

export default sendEmail;