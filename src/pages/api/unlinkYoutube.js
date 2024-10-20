import { adminDB } from '@/lib/firebaseAdmin';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { uid } = req.body;

    if (!uid) {
        return res.status(400).json({ message: 'User ID is required' });
    }

    try {
        const userRef = adminDB.collection('users').doc(uid);
        await userRef.update({
            youtubeRefreshToken: null
        });

        res.status(200).json({ message: 'YouTube連携が解除されました。' });
    } catch (error) {
        console.error('YouTube連携解除エラー:', error);
        res.status(500).json({ message: 'YouTube連携の解除に失敗しました。', error: error.message });
    }
}
