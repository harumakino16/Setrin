import nodemailer from 'nodemailer';

export const sendContactEmail = async ({ name, email, subject, message }) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: 'Setlink <setlink.contact@gmail.com>',
    to: 'setlink.contact@gmail.com',
    subject: `Setlinkからのお問い合わせ: ${subject}`,
    text: `Setlinkからのお問い合わせ\n\n名前: ${name}\nメール: ${email}\nメッセージ: ${message}`,
  };

  await transporter.sendMail(mailOptions);
};

export const sendFeedbackNotificationEmail = async ({ userName, content }) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: 'Setlink <setlink.contact@gmail.com>',
    to: 'setlink.contact@gmail.com',
    subject: `新しいフィードバックが届きました`,
    text: `Setlinkに新しいフィードバックが投稿されました。\n\n投稿者: ${userName}\n\n内容:\n${content}`,
  };

  await transporter.sendMail(mailOptions);
}; 