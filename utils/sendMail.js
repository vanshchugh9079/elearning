import nodemailer from "nodemailer";

const sendEmail = async ({ to, subject, text, html }) => {
  if (!to || !subject || (!text && !html)) {
    throw new Error("Missing required fields in sendEmail");
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com", // Better than 'service'
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"E Learner" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    html,
    headers: {
      "X-Priority": "3",
      "X-MSMail-Priority": "Normal",
      "Importance": "Normal",
    },
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent: ${info.response}`);
  } catch (error) {
    console.error(`❌ Failed to send email: ${error.message}`);
    throw new Error("Email could not be sent");
  }
};

export default sendEmail;
