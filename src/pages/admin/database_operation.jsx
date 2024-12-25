import { useState } from 'react';
import { getAuth } from 'firebase/auth';
import { doc, updateDoc, collection, getDocs, setDoc, getDoc, writeBatch, deleteField } from 'firebase/firestore';
import { db } from '@/../firebaseConfig';
import { useMessage } from '@/context/MessageContext';
import Layout from '@/pages/layout';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';


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

    const handleMigrateUserActivity = async () => {
        try {
            const usersCollection = collection(db, 'users');
            const usersSnapshot = await getDocs(usersCollection);
            
            // バッチ処理を準備
            let batch = writeBatch(db);
            let operationCount = 0;
            
            for (const userDoc of usersSnapshot.docs) {
                const userData = userDoc.data();
                const userId = userDoc.id;
                
                // 1. Setlistsの数を数える
                const setlistsRef = collection(db, 'users', userId, 'Setlists');
                const setlistsSnapshot = await getDocs(setlistsRef);
                const setlistCount = setlistsSnapshot.size;
                
                // 2. publicPagesの数を数える
                const publicPagesRef = collection(db, 'users', userId, 'publicPages');
                const publicPagesSnapshot = await getDocs(publicPagesRef);
                const publicListCount = publicPagesSnapshot.size;
                
                // 3. 既存のplaylistCreationCountを取得
                const oldPlaylistCount = userData.playlistCreationCount || 0;
                
                // 4. userActivityオブジェクトを準備
                const userActivity = {
                    ...(userData.userActivity || {}), // 既存のuserActivityがあれば保持
                    setlistCount,
                    publicListCount,
                    playlistCreationCount: oldPlaylistCount,
                    // 他のカウンターは既存の値を保持するか、未設定なら0で初期化
                    randomSetlistCount: userData.userActivity?.randomSetlistCount || 0,
                    monthlyRandomSetlistCount: userData.userActivity?.monthlyRandomSetlistCount || 0,
                    requestUtawakuCount: userData.userActivity?.requestUtawakuCount || 0,
                    monthlyRequestUtawakuCount: userData.userActivity?.monthlyRequestUtawakuCount || 0,
                    rouletteCount: userData.userActivity?.rouletteCount || 0,
                    monthlyRouletteCount: userData.userActivity?.monthlyRouletteCount || 0,
                    lastActivityAt: userData.userActivity?.lastActivityAt || null,
                };
                
                // 5. バッチ更新を追加
                const userRef = doc(db, 'users', userId);
                batch.update(userRef, {
                    userActivity,
                    // 古いフィールドを完全に削除
                    playlistCreationCount: deleteField(),
                });
                
                operationCount++;
                
                // 500操作ごとにバッチをコミットして新しいバッチを開始
                if (operationCount >= 500) {
                    await batch.commit();
                    batch = writeBatch(db);
                    operationCount = 0;
                }
            }
            
            // 残りのバッチをコミット
            if (operationCount > 0) {
                await batch.commit();
            }
            
            setMessageInfo({ 
                message: 'ユーザーアクティビティの移行が完了しました。', 
                type: 'success' 
            });
        } catch (error) {
            console.error('Migration error:', error);
            setMessageInfo({ 
                message: 'ユーザーアクティビティの移行に失敗しました: ' + error.message, 
                type: 'error' 
            });
        }
    };

    return (
        <Layout>
            <div className="p-5">
                <h2 className="text-2xl font-bold mb-4">データベース操作</h2>
                <div className="space-y-4">
                    <button 
                        onClick={handleSetFreePlan} 
                        className="bg-blue-500 text-white px-4 py-2 rounded block w-full"
                    >
                        全ユーザーのプランをFreeに設定
                    </button>
                    <button 
                        onClick={handleSetThemeColor} 
                        className="bg-green-500 text-white px-4 py-2 rounded block w-full"
                    >
                        全publicPagesにテーマカラーを設定
                    </button>
                    <button 
                        onClick={handleMigrateUserActivity}
                        className="bg-purple-500 text-white px-4 py-2 rounded block w-full"
                    >
                        ユーザーアクティビティデータを移行
                    </button>
                </div>
            </div>
        </Layout>
    );
};

export default DatabaseOperation;

// ページで翻訳データを取得する部分
export async function getStaticProps({ locale }) {
    return {
        props: {
            ...(await serverSideTranslations(locale, ['common'])),
        },
    };
}