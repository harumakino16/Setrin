import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '@/context/AuthContext';
import { db } from '../../firebaseConfig';
import { updateDoc, doc } from 'firebase/firestore';
import { Sidebar } from "@/components/Sidebar";
import { useRouter } from 'next/router';


function Settings() {
    const { currentUser, loading } = useContext(AuthContext);
    const [email, setEmail] = useState('');
    const [displayName, setDisplayName] = useState('');
    const router = useRouter();

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.NEXT_PUBLIC_CLIENT_ID}&redirect_uri=${process.env.NEXT_PUBLIC_REDIRECT_URI}&scope=${process.env.NEXT_PUBLIC_SCOPE}&response_type=code&prompt=consent&access_type=offline`;



    useEffect(() => {
        const { code } = router.query;
        if (code) {
            console.log('取得したcode:', code);
            exchangeCodeForTokens(code);
            // URLからcodeパラメータをクリアする
            router.replace(router.pathname, undefined, { shallow: true });
        }
    }, [router]);

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


    // codeを渡してリフレッシュトークンを取得
    async function exchangeCodeForTokens(code) {
        try {
            const response = await fetch('/api/getTokensFromCode', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ code })
            });

            if (!response.ok) {
                throw new Error(`An error has occurred: ${response.status}`);
            }

            const data = await response.json();
            // 直接Promiseを解決して、その結果を渡します。
            saveRefreshTokenInFirestore(data.refreshToken);
        } catch (error) {
            console.error('トークンの取得に失敗しました:', error);
        }
    }

    // リフレッシュトークンをデータベースに保存
    async function saveRefreshTokenInFirestore(refreshToken) {
        if (!currentUser) {
            console.log("ユーザーがいません");
            return;
        }

        const userRef = doc(db, 'users', currentUser.uid);
        try {
            // refreshTokenが正しくPromiseから解決された値として扱われるようにします。
            await updateDoc(userRef, {
                youtubeRefreshToken: refreshToken
            });
            console.log('リフレッシュトークンがFirestoreに保存されました。');
        } catch (error) {
            console.error('リフレッシュトークンの保存に失敗しました:', error);
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
                {currentUser.youtubeRefreshToken ? (
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


            </div>
        </div>
    );
}

export default Settings;
