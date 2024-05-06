import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '@/context/AuthContext';
import { db } from '../../firebaseConfig';
import { updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { Sidebar } from "@/components/Sidebar";
import { useRouter } from 'next/router';
import { youtubeConfig } from '../../youtubeConfig';
import Image from 'next/image';
import googleIcon from '../images/web_light_rd_SI@4x.png';
import youtubeIcon from '../images/youtube_social_icon_red.png';

function Settings() {
    const { currentUser, loading } = useContext(AuthContext);
    const [email, setEmail] = useState('');
    const [displayName, setDisplayName] = useState('');
    const router = useRouter();

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${youtubeConfig.clientId}&redirect_uri=${youtubeConfig.redirectUri}&scope=${youtubeConfig.scope}&response_type=code&prompt=consent&access_type=offline`;

    useEffect(() => {
        const { code } = router.query;
        if (code) {
            exchangeCodeForTokensAndSaveInFirestore(code);
            // URLからcodeパラメータをクリアする
            router.replace(router.pathname, undefined, { shallow: true });
        }
    }, [router]);

    if (loading) {
        return <div className="text-center py-10">ローディング中...</div>;
    }

    if (!currentUser) {
        return <div className="text-center py-10">ログインが必要です。ログインページへのリンクを表示するなどの処理をここに追加。</div>;
    }

    useEffect(() => {
        if (currentUser) {
            setEmail(currentUser.email || '');
            setDisplayName(currentUser.displayName || '');
        }
    }, [currentUser]);

    async function exchangeCodeForTokensAndSaveInFirestore(code) {
        try {
            const response = await fetch('/api/getTokensFromCode', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ code, currentUser })
            });

            if (!response.ok) {
                throw new Error(`An error has occurred: ${response.status}`);
            }

        } catch (error) {
            console.error('トークンの取得に失敗しました:', error);
        }
    }

    const handleUpdateProfile = async () => {
        if (!currentUser) {
            alert('ログインしていないため、設定を更新できません。');
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

    const handleDeleteAccount = async () => {
        if (!currentUser) {
            alert('ログインしていないため、アカウントを削除できません。');
            return;
        }

        const userRef = doc(db, 'users', currentUser.uid);
        try {
            await deleteDoc(userRef);
            alert('アカウントが削除されました。');
            router.push('/login'); // ログインページにリダイレクト
        } catch (error) {
            console.error('アカウントの削除に失敗しました:', error);
            alert('アカウントの削除に失敗しました。');
        }
    };


    return (
        <div className="flex">
            <Sidebar />
            <div className="flex-grow p-8">
                <h1 className="text-2xl font-bold mb-4">設定</h1>
                <div className='mb-6'>
                    <div className="mb-6">
                        <label className="block mb-2 text-gray-700">メールアドレス:</label>
                        <input type="email" className="border p-2 rounded w-full shadow-sm" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div className="mb-6">
                        <label className="block mb-2 text-gray-700">表示名:</label>
                        <input type="text" className="border p-2 rounded w-full shadow-sm" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
                    </div>
                    <label className="block mb-2 text-gray-700">Youtubeとの連携:</label>
                    <div className="bg-white shadow-md rounded px-5 py-3 flex justify-between items-center">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Image src={youtubeIcon} alt="Youtubeに接続" width={50} />
                                <div className="flex flex-col">
                                    {currentUser.youtubeRefreshToken ? (
                                        <div className="flex items-center">
                                            <svg className="w-4 h-4 text-green-500 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                                                <path d="M5 13l4 4L19 7"></path>
                                            </svg>
                                            <label className="text-green-500 font-bold">連携中</label>
                                        </div>
                                    ) : (
                                        <label className="text-red-500">未連携</label>
                                    )}
                                    <div className=" text-gray-700 text-sm">
                                        Youtubeと連携することで作成したセットリストをYoutubeの再生リストに追加することができます。
                                    </div>

                                </div>
                            </div>
                        </div>
                        {currentUser.youtubeRefreshToken ? (
                            <button className="mt-4 block text-center bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                                解除する
                            </button>
                        ) : (
                            <a href={authUrl} className="mt-4 block text-center">
                                <Image src={googleIcon} alt="Youtubeに接続" width={180} />
                            </a>
                        )}
                    </div>

                </div>
                <button onClick={handleUpdateProfile} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    更新
                </button>
                <button onClick={handleDeleteAccount} className="mt-4 float-right bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                    アカウントを削除
                </button>
            </div>
        </div>
    );
}

export default Settings;
