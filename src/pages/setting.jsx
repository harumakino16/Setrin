import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '@/context/AuthContext';
import { db } from '../../firebaseConfig';
import { updateDoc, doc } from 'firebase/firestore';
import { Sidebar } from "@/components/Sidebar";
import { Keys, authUrl } from '../../KEYS';


function Settings() {
    const { currentUser, loading } = useContext(AuthContext);
    const [email, setEmail] = useState('');
    const [displayName, setDisplayName] = useState('');

    if (loading) {
        return <div>ローディング中...</div>;
    }

    if (!currentUser) {
        return <div>ログインが必要です。ログインページへのリンクを表示するなどの処理をここに追加。</div>;
    }

    useEffect(() => {
        if (currentUser) {
            setEmail(currentUser.email || '');
            setDisplayName(currentUser.displayName || '');
            console.log(currentUser.test);
            console.log(currentUser);
        }
    }, [currentUser]);

    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash;
            extractAccessTokenFromHash(hash);
        };

        window.addEventListener('hashchange', handleHashChange);
        handleHashChange(); // 初期ロード時にも実行

        return () => {
            window.removeEventListener('hashchange', handleHashChange);
        };
    }, []);



    function extractAccessTokenFromHash(hash) {
        const params = new URLSearchParams(hash.substring(1)); // 先頭の '#' を取り除く
        const tempAccessToken = params.get('access_token');
        if (tempAccessToken) {
            console.log(tempAccessToken);
            // window.location.hash = ''; // アクセストークンを取得した後にハッシュをクリア
            updateAccessTokenInFirestore(tempAccessToken); // Firestoreに直接保存
        }
    }

    async function updateAccessTokenInFirestore(accessToken) {
        if (currentUser) {
            const userRef = doc(db, 'users', currentUser.uid);
            try {
                await updateDoc(userRef, {
                    youtubeAccessToken: accessToken
                });
                console.log('アクセストークンがFirestoreに保存されました。');
            } catch (error) {
                console.error('アクセストークンの保存に失敗しました:', error);
            }
        }else{
            console.log("ユーザーがいません");
        }
    }

    const handleUpdateProfile = async () => {
        if (!currentUser) {
            alert('ログインしていないため、設定を更新できませんf。');
            return;
        }

        const userRef = doc(db, 'users', currentUser.uid);
        try {
            await updateDoc(userRef, {
                email: email,
                displayName: displayName,
            });
            alert('プロファイルが更新されました。');
        } catch (error) {
            console.error('プロファイルの更新に失敗しました:', error);
            alert('プロファイルの更新に失敗しました。');
        }
    };

    console.count("レンダリングされました");
    
    return (
        <div className="flex">
            <Sidebar />
            <div className="flex-grow p-8">
                <h1 className="text-2xl font-bold mb-4">設定</h1>
                <div className="mb-6">
                    <label className="block mb-2">メールアドレス:</label>
                    <input type="email" className="border p-2 rounded w-full" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="mb-6">
                    <label className="block mb-2">表示名:</label>
                    <input type="text" className="border p-2 rounded w-full" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
                </div>
                {currentUser.youtubeAccessToken ? (
                    <div className="mt-4 text-green-500 font-bold">
                        YouTubeとリンク済み
                    </div>
                ) : (
                    <a href={authUrl} className="mt-4 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded block text-center">
                        Youtubeに接続
                    </a>
                )}
                <button onClick={handleUpdateProfile} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    更新
                </button>

                <button onClick={() => createPlaylist()} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    プレイリストを作成
                </button>
            </div>
        </div>
    );
}

export default Settings;
