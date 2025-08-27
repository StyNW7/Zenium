import nodemailer from "nodemailer";

const smtpHost = process.env.SMTP_HOST;
const smtpPort = process.env.SMTP_PORT;
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const fromEmail = process.env.EMAIL_FROM;

let transporter = null;

if (smtpHost && smtpUser && smtpPass) {
  transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: { user: smtpUser, pass: smtpPass },
  });
}

export async function sendEmail({ to, subject, html, text }) {
  if (!to) throw new Error("'to' is required");
  const mailOptions = {
    from: fromEmail,
    to,
    subject,
    text,
    html,
  };

  if (!transporter) {
    // Fallback: log email during development
    console.log("[EMAIL:FALLBACK]", mailOptions);
    return { messageId: "dev-fallback", accepted: [to], rejected: [] };
  }

  const info = await transporter.sendMail(mailOptions);
  return info;
}


