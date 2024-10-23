import { adminDB, FieldValue } from '@/lib/firebaseAdmin';

export default async function handler(req, res) {
  console.log('API handler started');
  if (req.method !== 'POST') {
    console.log('Method not allowed:', req.method);
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { userId } = req.body;
  console.log('Received userId:', userId);

  if (!userId) {
    console.log('User ID is missing');
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    console.log('Attempting to fetch songs for user:', userId);
    const songsRef = adminDB.collection('users').doc(userId).collection('Songs');
    const snapshot = await songsRef.get();
    console.log('Fetched songs count:', snapshot.size);

    const batch = adminDB.batch();
    console.log('Created batch');

    snapshot.forEach((doc) => {
      const songRef = doc.ref;
      const createTime = doc.createTime;
      console.log('Processing song:', doc.id, 'Create time:', createTime);

      if (createTime) {
        batch.update(songRef, {
          createdAt: createTime.toDate(),
          updatedAt: FieldValue.serverTimestamp()
        });
      } else {
        batch.update(songRef, {
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp()
        });
      }
    });

    console.log('Attempting to commit batch');
    await batch.commit();
    console.log('Batch committed successfully');

    res.status(200).json({ message: '全ての曲のデータが更新されました。' });
  } catch (error) {
    console.error('曲のデータの更新に失敗しました。', error);
    console.error('Error details:', error.stack);
    res.status(500).json({ message: '曲のデータの更新に失敗しました。', error: error.message });
  }
}