import { adminUUIDs } from '@/config/admin';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, cert } from 'firebase-admin/app';
import { firebaseAdminConfig } from '@/lib/firebaseAdmin'; // firebaseAdminConfigを適切に設定

if (!initializeApp.length) {
  initializeApp({
    credential: cert(firebaseAdminConfig),
  });
}

export const isAdmin = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: '認証トークンがありません。' });
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await getAuth().verifyIdToken(idToken);
    if (!adminUUIDs.includes(decodedToken.uid)) {
      return res.status(403).json({ message: '管理者権限がありません。' });
    }
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('認証エラー:', error);
    return res.status(401).json({ message: '無効な認証トークンです。' });
  }
}; 