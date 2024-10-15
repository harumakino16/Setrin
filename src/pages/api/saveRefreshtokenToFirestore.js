import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { refreshToken, currentUser } = req.body;

    if (!refreshToken || !currentUser) {
        return res.status(400).json({ message: 'Missing required parameters' });
    }

    try {
        const userRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userRef, {
            youtubeRefreshToken: refreshToken
        });

        res.status(200).json({ message: 'リフレッシュトークンが保存されました。' });
    } catch (error) {
        
        res.status(500).json({ message: `Firestoreへの保存に失敗しました: ${error.message}` });
    }
}
