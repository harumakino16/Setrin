import { useState } from 'react';
import { getAuth } from 'firebase/auth';
import { doc, updateDoc, collection, getDocs, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/../firebaseConfig';
import { useMessage } from '@/context/MessageContext';
import Layout from '@/pages/layout';

const DatabaseOperation = () => {
    const [userId, setUserId] = useState('');
    const { setMessageInfo } = useMessage();
    const auth = getAuth();

    const handleSetFreePlan = async () => {
        try {
            const usersCollection = collection(db, 'users');
            const usersSnapshot = await getDocs(usersCollection);
            const updatePromises = usersSnapshot.docs.map(async (doc) => {
                const userRef = doc.ref;
                await updateDoc(userRef, {
                    plan: 'free',
                });
            });
            await Promise.all(updatePromises);
            setMessageInfo({ message: '全てのユーザーのプランがFreeに設定されました。', type: 'success' });
        } catch (error) {
            setMessageInfo({ message: 'プランの設定に失敗しました。', type: 'error' });
            console.error(error);
        }
    };

    const handleSetThemeColor = async () => {
        try {
            const publicPagesCollection = collection(db, 'publicPages');
            const publicPagesSnapshot = await getDocs(publicPagesCollection);

            publicPagesSnapshot.docs.map(async (docSnapshot) => {
                const pageRef = docSnapshot.ref;
                const pageData = docSnapshot.data();
                console.log(pageData.name);
                const userDocRef = doc(db, 'users', pageData.userId);
                const userDoc = await getDoc(userDocRef);

                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    const themeColor = userData.theme;

                    if (themeColor) {
                        await setDoc(pageRef, {
                            color: themeColor,
                        },{merge:true});
                    } else {
                        await setDoc(pageRef, {
                            color: "blue",
                        },{merge:true});
                        console.warn(`ユーザーID ${pageData.userId} にテーマカラーが設定されていません。`);
                    }
                } else {
                    console.warn(`ユーザーID ${pageData.userId} のドキュメントが存在しません。`);
                }
            });
            setMessageInfo({ message: '全てのpublicPagesにテーマカラーが設定されました。', type: 'success' });
        } catch (error) {
            setMessageInfo({ message: 'テーマカラーの設定に失敗しました。', type: 'error' });
            console.error(error);
        }
    };

    return (
        <Layout>
            <div className="p-5">
                <h2 className="text-2xl font-bold mb-4">データベース操作</h2>
                <button onClick={handleSetFreePlan} className="bg-blue-500 text-white px-4 py-2 rounded">
                    全ユーザーのプランをFreeに設定
                </button>
                <button onClick={handleSetThemeColor} className="bg-green-500 text-white px-4 py-2 rounded mt-4">
                    全publicPagesにテーマカラーを設定
                </button>
            </div>
        </Layout>
    );
};

export default DatabaseOperation;