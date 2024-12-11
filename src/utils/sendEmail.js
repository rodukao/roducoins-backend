const nodemailer = require('nodemailer');

// Função genérica para enviar e-mails
async function sendEmail({ to, subject, text }) {
  // Ajuste host, port, secure, auth conforme seu provedor SMTP
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // true para port 465, false para 587
    auth: {
      user: process.env.MAILER_USER, 
      pass: process.env.MAILER_PASSWORD
    }
  });

  const info = await transporter.sendMail({
    from: '"Roducoins" <no-reply@roducoins.com>',
    to,
    subject,
    text,
  });

  console.log('E-mail enviado:', info.messageId);
}

module.exports = sendEmail;