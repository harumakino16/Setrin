import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '@/context/AuthContext';
import { db } from '../../firebaseConfig';
import { updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { useRouter } from 'next/router';
import Image from 'next/image';
import googleIcon from '../../public/images/web_light_rd_SI@4x.png';
import youtubeIcon from '../../public/images/youtube_social_icon_red.png';
import { useMessage } from '@/context/MessageContext';
import Loading from '@/components/loading';
import { deleteUser, getAuth, reauthenticateWithPopup, GoogleAuthProvider } from 'firebase/auth';


function Settings() {
    const { currentUser, loading } = useContext(AuthContext);
    const [email, setEmail] = useState('');
    const [displayName, setDisplayName] = useState('');
    const router = useRouter();
    const { setMessageInfo } = useMessage();

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.NEXT_PUBLIC_GOOGLE_CLOUD_CLIENT_ID}&redirect_uri=${process.env.NEXT_PUBLIC_REDIRECT_URI}&scope=${process.env.NEXT_PUBLIC_YOUTUBE_SCOPE}&response_type=code&prompt=consent&access_type=offline`;

    useEffect(() => {
        const { code } = router.query;
        if (code) {
            handleCodeExchangeAndSave(code);
            router.replace(router.pathname, undefined, { shallow: true });
        }
    }, [router]);

    useEffect(() => {
        if (currentUser) {
            setEmail(currentUser.email || '');
            setDisplayName(currentUser.displayName || '');
        }
    }, [currentUser]);

    if (loading) {
        return <Loading />;
    }

    if (!currentUser) {
        return <div className="text-center py-10">ログインが必要です。ログインページへのリンクを表示するなどの処理をここに追加。</div>;
    }



    async function handleCodeExchangeAndSave(code) {
        try {
            const tokenResponse = await fetch('/api/exchangeCodeForTokens', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ code })
            });

            if (!tokenResponse.ok) {
                throw new Error('トークンの取得に失敗しました。');
            }

            const { refreshToken } = await tokenResponse.json();

            const saveResponse = await fetch('/api/saveRefreshtokenToFirestore', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({refreshToken, currentUser})
            });

            if (!saveResponse.ok) {
                const errorData = await saveResponse.json();
                throw new Error(`Firestoreへの保存に失敗しました: ${errorData.message}`);
            }

            const saveResult = await saveResponse.json();
            setMessageInfo({ message: saveResult.message, type: 'success' });
        } catch (error) {
            console.error('エラー:', error);
            setMessageInfo({ message: error.message, type: 'error' });
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
            
            alert('プロファイルの更新に失敗しました。');
        }
    };

    const handleDeleteAccount = async () => {
        if (!currentUser) {
            alert('ログインしていないため、アカウントを削除できません。');
            return;
        }

        const userRef = doc(db, 'users', currentUser.uid);
        const auth = getAuth();
        const provider = new GoogleAuthProvider();

        try {
            // 再認証を行う
            await reauthenticateWithPopup(auth.currentUser, provider);

            // Firestoreからユーザー情報を削除
            await deleteDoc(userRef);

            // Firebase Authenticationからユーザーを削除
            await deleteUser(auth.currentUser);

            alert('アカウントが削除されました。');
        } catch (error) {
            
            alert('アカウントの削除に失敗しました。');
        }
    };

    const handleUnlinkYoutube = async () => {
        if (!currentUser) {
            alert('ログインしていないため、連携を解除できません。');
            return;
        }

        try {
            const idToken = await currentUser.getIdToken();
            const response = await fetch('/api/unlinkYoutube', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                },
                body: JSON.stringify({ uid: currentUser.uid })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'YouTube連携の解除に失敗しました。');
            }

            setMessageInfo({ message: 'YouTubeとの連携が解除されました。', type: 'success' });
        } catch (error) {
            console.error('YouTube連携解除エラー:', error);
            setMessageInfo({ message: error.message, type: 'error' });
        }
    };

    return (
        <div className="flex">
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
                            <button onClick={handleUnlinkYoutube} className="mt-4 block text-center bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
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
