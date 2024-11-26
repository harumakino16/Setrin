import nodemailer from 'nodemailer';
import { db } from '@/../firebaseConfig'; // Firebaseの設定ファイルをインポート
import { collection, addDoc } from 'firebase/firestore';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: '名前、メールアドレス、メッセージは必須です。' });
    }

    try {
      // メール送信の設定
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER, // 環境変数に設定したメールアドレス
          pass: process.env.EMAIL_PASS, // 環境変数に設定したメールパスワード
        },
      });

      const mailOptions = {
        from: 'Setlink <px.studio.2020@gmail.com>',
        to: 'px.studio.2020@gmail.com', // 受信者のメールアドレス
        subject: `Setlinkからのお問い合わせ: ${subject}`,
        text: `Setlinkからのお問い合わせ\n\n名前: ${name}\nメール: ${email}\nメッセージ: ${message}`,
      };

      await transporter.sendMail(mailOptions);

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