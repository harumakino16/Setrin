import { adminDB } from '@/lib/firebaseAdmin';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { refreshToken, currentUser } = req.body;

    if (!refreshToken || !currentUser) {
        return res.status(400).json({ message: 'Missing required parameters' });
    }

    try {
        const userRef = adminDB.collection('users').doc(currentUser.uid);
        await userRef.update({
            youtubeRefreshToken: refreshToken,
        });

        res.status(200).json({ message: '連携が完了しました' });
    } catch (error) {
        console.error('Firestoreへの保存エラー:', error);
        res.status(500).json({
            message: `Firestoreへの保存に失敗しました: ${error.message}`,
            error: error.toString(),
        });
    }
}
