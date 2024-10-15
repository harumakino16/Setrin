import { getFirestore, doc, updateDoc } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from '../../../firebaseConfig';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { uid } = req.body;

    if (!uid) {
        return res.status(400).json({ message: 'User ID is required' });
    }

    try {
        const userRef = doc(db, 'users', uid);
        await updateDoc(userRef, {
            youtubeRefreshToken: null
        });

        res.status(200).json({ message: 'YouTube連携が解除されました。' });
    } catch (error) {
        
        res.status(500).json({ message: 'YouTube連携の解除に失敗しました。' });
    }
}
