import { isAdmin } from '@/middleware/adminAuth';
import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/firebaseConfig';

export default async function handler(req, res) {
  await isAdmin(req, res, () => {});

  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    await deleteDoc(doc(db, 'users', userId));
    res.status(200).json({ message: 'ユーザーが削除されました。' });
  } catch (error) {
    console.error('ユーザー削除エラー:', error);
    res.status(500).json({ message: 'ユーザーの削除に失敗しました。' });
  }
} 