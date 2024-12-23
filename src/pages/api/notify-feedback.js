import { sendFeedbackNotificationEmail } from './mailer.server';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { userName, content } = req.body;
    await sendFeedbackNotificationEmail({ userName, content });
    res.status(200).json({ message: 'Notification email sent successfully' });
  } catch (error) {
    console.error('Error sending notification email:', error);
    res.status(500).json({ message: 'Failed to send notification email' });
  }
} 