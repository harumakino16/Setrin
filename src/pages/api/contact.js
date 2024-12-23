import { db } from '@/../firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import { sendContactEmail } from '@/utils/mailer';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: '名前、メールアドレス、メッセージは必須です。' });
    }

    try {
      // メール送信
      await sendContactEmail({ name, email, subject, message });

      // Firestoreにデータを保存
      const contactRef = collection(db, 'contacts');
      await addDoc(contactRef, {
        name,
        email,
        subject,
        message,
        createdAt: new Date(),
      });

      res.status(200).json({ message: 'お問い合わせが正常に送信されました。' });
    } catch (error) {
      console.error('エラーが発生しました:', error);
      res.status(500).json({ error: 'サーバーエラーが発生しました。' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}