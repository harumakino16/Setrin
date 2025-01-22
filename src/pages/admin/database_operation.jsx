import { useState } from 'react';
import { getAuth } from 'firebase/auth';
import { doc, updateDoc, collection, getDocs, setDoc, getDoc, writeBatch, deleteField } from 'firebase/firestore';
import { db } from '@/../firebaseConfig';
import { useMessage } from '@/context/MessageContext';
import Layout from '@/pages/layout';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import withAdminAuth from '@/components/withAdminAuth';
import { Timestamp } from 'firebase/firestore';

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
            
            console.log(`総ユーザー数: ${usersSnapshot.size}`);
            let processedUsers = 0;
            
            // バッチ処理を準備
            let batch = writeBatch(db);
            let operationCount = 0;
            
            for (const userDoc of usersSnapshot.docs) {
                const userData = userDoc.data();
                const userId = userDoc.id;
                
                // 進行状況をログ出力
                processedUsers++;
                if (processedUsers % 10 === 0) {  // 10ユーザーごとに進捗を表示
                    console.log(`処理済み: ${processedUsers}/${usersSnapshot.size} ユーザー (${Math.round(processedUsers/usersSnapshot.size*100)}%)`);
                }
                
                // 1. Setlistsの数を数える
                const setlistsRef = collection(db, 'users', userId, 'Setlists');
                const setlistsSnapshot = await getDocs(setlistsRef);
                const setlistCount = setlistsSnapshot.size;
                
                // 2. publicPagesの数を数える
                const publicPagesRef = collection(db, 'users', userId, 'publicPages');
                const publicPagesSnapshot = await getDocs(publicPagesRef);
                const publicListCount = publicPagesSnapshot.size;
                
                // データ収集結果をログ出力
                console.log(`ユーザーID: ${userId} - セットリスト: ${setlistCount}, 公開リスト: ${publicListCount}`);
                
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
                
                // バッチコミット時にもログを出力
                if (operationCount >= 500) {
                    console.log('バッチをコミット中...');
                    await batch.commit();
                    batch = writeBatch(db);
                    operationCount = 0;
                    console.log('バッチコミット完了');
                }
            }
            
            // 残りのバッチをコミット
            if (operationCount > 0) {
                console.log('最終バッチをコミット中...');
                await batch.commit();
                console.log('最終バッチコミット完了');
            }
            
            console.log('全ユーザーの移行が完了しました！');
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

    const handleCreateNoteField = async () => {
        try {
            const usersCollection = collection(db, 'users');
            const usersSnapshot = await getDocs(usersCollection);
            
            console.log(`総ユーザー数: ${usersSnapshot.size}`);
            let processedUsers = 0;
            let totalUpdatedSongs = 0;
            
            let batch = writeBatch(db);
            let operationCount = 0;
            
            for (const userDoc of usersSnapshot.docs) {
                const userId = userDoc.id;
                
                processedUsers++;
                console.log(`処理中のユーザー: ${processedUsers}/${usersSnapshot.size} (${Math.round(processedUsers/usersSnapshot.size*100)}%)`);
                
                const songsRef = collection(db, 'users', userId, 'Songs');
                const songsSnapshot = await getDocs(songsRef);
                
                for (const songDoc of songsSnapshot.docs) {
                    const songData = songDoc.data();
                    if (!songData.note) {
                        // noteフィールドを追加（memoの値をコピー）
                        batch.update(songDoc.ref, {
                            note: songData.memo || '',
                            memo: "",
                        });
                        operationCount++;
                        totalUpdatedSongs++;
                    }
                    
                    if (operationCount >= 500) {
                        console.log('バッチをコミット中...');
                        await batch.commit();
                        batch = writeBatch(db);
                        operationCount = 0;
                        console.log('バッチコミット完了');
                    }
                }
            }
            
            if (operationCount > 0) {
                console.log('最終バッチをコミット中...');
                await batch.commit();
                console.log('最終バッチコミット完了');
            }
            
            console.log(`移行完了！更新された曲の総数: ${totalUpdatedSongs}`);
            setMessageInfo({ 
                message: `備考(note)フィールドの作成が完了しました。${totalUpdatedSongs}曲を更新しました。`, 
                type: 'success' 
            });
        } catch (error) {
            console.error('Migration error:', error);
            setMessageInfo({ 
                message: 'データの移行に失敗しました: ' + error.message, 
                type: 'error' 
            });
        }
    };

    const handleAddYoutubeUrlToRequests = async () => {
        try {
            // 最初にpublicPagesコレクションから直接取得
            const publicPagesRef = collection(db, 'publicPages');
            const publicPagesSnapshot = await getDocs(publicPagesRef);
            
            console.log(`総ページ数: ${publicPagesSnapshot.size}`);
            let processedPages = 0;
            let totalUpdatedRequests = 0;
            
            let batch = writeBatch(db);
            let operationCount = 0;
            
            // ページごとに処理
            for (const pageDoc of publicPagesSnapshot.docs) {
                const pageData = pageDoc.data();
                const userId = pageData.userId; // publicPagesドキュメントにはuserIdが含まれている
                const pageId = pageDoc.id;
                
                processedPages++;
                
                // requestsコレクションを取得
                const requestsRef = collection(db, 'users', userId, 'publicPages', pageId, 'requests');
                const requestsSnapshot = await getDocs(requestsRef);
                
                if (!requestsSnapshot.empty) {
                    console.log(`処理中のページ: ${processedPages}/${publicPagesSnapshot.size} (${Math.round(processedPages/publicPagesSnapshot.size*100)}%) - リクエスト数: ${requestsSnapshot.size}`);
                    
                    // リクエストごとに処理
                    for (const requestDoc of requestsSnapshot.docs) {
                        const requestData = requestDoc.data();
                        
                        if (requestData.songId && !requestData.youtubeUrl) {
                            const songRef = doc(db, 'users', userId, 'Songs', requestData.songId);
                            const songDoc = await getDoc(songRef);
                            
                            if (songDoc.exists()) {
                                const songData = songDoc.data();
                                if (songData.youtubeUrl) {
                                    batch.update(requestDoc.ref, {
                                        youtubeUrl: songData.youtubeUrl
                                    });
                                    operationCount++;
                                    totalUpdatedRequests++;
                                }
                            }
                        }
                        
                        if (operationCount >= 500) {
                            console.log('バッチをコミット中...');
                            await batch.commit();
                            batch = writeBatch(db);
                            operationCount = 0;
                            console.log('バッチコミット完了');
                        }
                    }
                }
            }
            
            if (operationCount > 0) {
                console.log('最終バッチをコミット中...');
                await batch.commit();
                console.log('最終バッチコミット完了');
            }
            
            console.log(`移行完了！更新されたリクエストの総数: ${totalUpdatedRequests}`);
            setMessageInfo({ 
                message: `リクエストへのYouTube URL追加が完了しました。${totalUpdatedRequests}件のリクエストを更新しました。`, 
                type: 'success' 
            });
        } catch (error) {
            console.error('Migration error:', error);
            setMessageInfo({ 
                message: 'YouTubeURLの追加に失敗しました: ' + error.message, 
                type: 'error'
            });
        }
    };

    const handleCreateSampleMetrics = async () => {
        try {
            let batch = writeBatch(db);
            let operationCount = 0;
            
            // 過去3ヶ月分のデータを生成
            const now = new Date();
            const startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1); // 3ヶ月前の1日

            for (let d = new Date(startDate); d <= now; d.setDate(d.getDate() + 1)) {
                const date = new Date(d);
                const dayOfMonth = date.getDate();
                
                // 基準値を設定（日付が進むにつれて少しずつ増加）
                const baseNewUsers = 5 + Math.floor(dayOfMonth / 3);
                const baseAdUsers = 3 + Math.floor(dayOfMonth / 4);
                const basePaidUsers = 20 + Math.floor(dayOfMonth / 2);
                const baseMAU = 100 + dayOfMonth * 2;

                // ランダムな変動を加える
                const metricsData = {
                    date: date,
                    newUsers: baseNewUsers + Math.floor(Math.random() * 5),
                    adUsers: baseAdUsers + Math.floor(Math.random() * 3),
                    mau: baseMAU + Math.floor(Math.random() * 20),
                    paidUsers: basePaidUsers + Math.floor(Math.random() * 5),
                    adPaidUsers: Math.floor(baseAdUsers * 0.4) + Math.floor(Math.random() * 2),
                    createdAt: Timestamp.fromDate(date)
                };

                // adConversionRateを計算
                metricsData.adConversionRate = 
                    metricsData.adUsers > 0 
                        ? (metricsData.adPaidUsers / metricsData.adUsers) * 100 
                        : 0;

                const docRef = doc(collection(db, 'metrics'));
                batch.set(docRef, metricsData);
                operationCount++;

                if (operationCount >= 500) {
                    await batch.commit();
                    batch = writeBatch(db);
                    operationCount = 0;
                }
            }

            if (operationCount > 0) {
                await batch.commit();
            }

            setMessageInfo({ 
                message: 'サンプルのメトリクスデータが作成されました。', 
                type: 'success' 
            });
        } catch (error) {
            console.error('Error creating sample metrics:', error);
            setMessageInfo({ 
                message: 'メトリクスデータの作成に失敗しました: ' + error.message, 
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
                    <button 
                        onClick={handleCreateNoteField}
                        className="bg-yellow-500 text-white px-4 py-2 rounded block w-full"
                    >
                        備考(note)フィールドを作成
                    </button>
                    <button 
                        onClick={handleAddYoutubeUrlToRequests}
                        className="bg-pink-500 text-white px-4 py-2 rounded block w-full"
                    >
                        リクエストにYouTube URLを追加
                    </button>
                    <button 
                        onClick={handleCreateSampleMetrics}
                        className="bg-pink-500 text-white px-4 py-2 rounded block w-full"
                    >
                        サンプルメトリクスデータを作成
                    </button>
                </div>
            </div>
        </Layout>
    );
};

export default withAdminAuth(DatabaseOperation);

// ページで翻訳データを取得する部分
export async function getStaticProps({ locale }) {
    return {
        props: {
            ...(await serverSideTranslations(locale, ['common'])),
        },
    };
}