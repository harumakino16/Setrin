import { useContext } from 'react';
import { db } from '../../firebaseConfig';
import { doc, getDoc, collection, addDoc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { AuthContext } from '@/context/AuthContext';
import { useMessage } from '@/context/MessageContext';
import { FREE_PLAN_MAX_SETLISTS } from '@/constants';

export const useSetlistCreation = () => {
    const { currentUser } = useContext(AuthContext);
    const { setMessageInfo } = useMessage();

    const createSetlist = async ({ name, songIds, existingSetlists = [] }) => {
        if (!currentUser) {
            setMessageInfo({ message: 'エラー：ユーザーが認証されていません', type: 'error' });
            return null;
        }

        try {
            // 無料プランのチェック
            if (currentUser.plan === 'free' && existingSetlists.length >= FREE_PLAN_MAX_SETLISTS) {
                setMessageInfo({ type: 'error', message: `無料プランでは最大${FREE_PLAN_MAX_SETLISTS}個のセットリストまで保存できます。` });
                return null;
            }

            const setlistData = {
                name,
                songIds,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            const setlistsRef = collection(db, `users/${currentUser.uid}/Setlists`);
            const docRef = await addDoc(setlistsRef, setlistData);

            // ユーザーアクティビティの更新
            const userRef = doc(db, 'users', currentUser.uid);
            await updateDoc(userRef, {
                'userActivity.setlistCount': increment(1),
                'userActivity.lastActivityAt': serverTimestamp(),
            });

            setMessageInfo({ type: 'success', message: 'セットリストを作成しました。' });
            return docRef.id;

        } catch (error) {
            console.error('Error creating setlist:', error);
            setMessageInfo({ type: 'error', message: 'セットリストの作成に失敗しました。' });
            return null;
        }
    };

    return { createSetlist };
}; 