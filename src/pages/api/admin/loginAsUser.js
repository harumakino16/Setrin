import { isAdmin } from '@/middleware/adminAuth';
import { getAuth } from 'firebase-admin/auth';

export default async function handler(req, res) {
  await isAdmin(req, res, () => {});

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    const auth = getAuth();
    const user = await auth.getUser(userId);
    const customToken = await auth.createCustomToken(user.uid);

    res.status(200).json({ token: customToken });
  } catch (error) {
    console.error('Error logging in as user:', error);
    res.status(500).json({ message: 'Failed to log in as user.' });
  }
} 