import { isAdmin } from '@/middleware/adminAuth';

export default async function handler(req, res) {
  await isAdmin(req, res, () => {});

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // 管理者専用の処理をここに実装
    res.status(200).json({ message: '管理者機能が実行されました。' });
  } catch (error) {
    console.error('管理者処理エラー:', error);
    res.status(500).json({ message: 'サーバーエラーが発生しました。' });
  }
} 