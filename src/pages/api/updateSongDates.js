import { adminDB } from '@/lib/firebaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    const songsRef = adminDB.collection('users').doc(userId).collection('Songs');
    const snapshot = await songsRef.get();

    const batch = adminDB.batch();

    snapshot.docs.forEach((doc) => {
      const songRef = songsRef.doc(doc.id);
      const createTime = doc.createTime.toDate();

      batch.update(songRef, {
        createdAt: createTime,
        updatedAt: createTime
      });
    });

    await batch.commit();
    res.status(200).json({ message: '全ての曲のデータが更新されました。' });
  } catch (error) {
    console.error('Error updating song dates:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
