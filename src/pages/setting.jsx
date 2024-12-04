import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '@/context/AuthContext';
import { db } from '../../firebaseConfig';
import { updateDoc, doc, deleteDoc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { useRouter } from 'next/router';
import Image from 'next/image';
import googleIcon from '../../public/images/web_light_rd_SI@4x.png';
import youtubeIcon from '../../public/images/youtube_social_icon_red.png';
import { useMessage } from '@/context/MessageContext';
import Loading from '@/components/loading';
import { deleteUser, getAuth, reauthenticateWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { useTheme } from '@/context/ThemeContext';
import Switch from '@/components/Switch';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy } from '@fortawesome/free-solid-svg-icons';
import Layout from '@/pages/layout';
import { faSignOutAlt, faChevronUp, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { loadStripe } from '@stripe/stripe-js';

function Settings() {
    const { currentUser, loading, setCurrentUser } = useContext(AuthContext);
    const [email, setEmail] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [selectedTheme, setSelectedTheme] = useState(currentUser?.theme || 'blue');
    const router = useRouter();
    const { setMessageInfo } = useMessage();
    const { theme } = useTheme();
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.NEXT_PUBLIC_GOOGLE_CLOUD_CLIENT_ID}&redirect_uri=${process.env.NEXT_PUBLIC_REDIRECT_URI}&scope=${process.env.NEXT_PUBLIC_YOUTUBE_SCOPE}&response_type=code&prompt=consent&access_type=offline`;
    const columnLabels = [
        { key: 'title', label: '曲名' },
        { key: 'artist', label: 'アーティスト' },
        { key: 'genre', label: 'ジャンル' },
        { key: 'youtubeUrl', label: 'YouTubeリンク' },
        { key: 'tags', label: 'タグ' },
        { key: 'singingCount', label: '歌唱回数' },
        { key: 'skillLevel', label: '熟練度' }
    ];
    const [publicPageSettings, setPublicPageSettings] = useState({
        enabled: false,
        pageId: '',
        displayName: '',
        description: '',
        visibleColumns: {
            title: true,
            artist: true,
            genre: true,
            youtubeUrl: true,
            tags: true,
            singingCount: false,
            skillLevel: false
        }
    });
    const [isAccordionOpen, setIsAccordionOpen] = useState(false);
    const { upgrade_success } = router.query;
    const [cancelAt, setCancelAt] = useState(null);

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

            const fetchPublicPageSettings = async () => {
                const publicPageRef = doc(db, 'users', currentUser.uid, 'publicPages', 'settings');
                const publicPageDoc = await getDoc(publicPageRef);
                if (publicPageDoc.exists()) {
                    setPublicPageSettings(publicPageDoc.data());
                }
            };

            fetchPublicPageSettings();
        }
    }, [currentUser]);

    useEffect(() => {
        if (upgrade_success) {
            setMessageInfo({ message: 'プランをアップグレードしました', type: 'success' });
            router.replace('/setting', undefined, { shallow: true });
        }
    }, [upgrade_success, router]);

    useEffect(() => {
        const fetchSubscriptionStatus = async () => {
            try {
                const response = await fetch('/api/get-subscription-status', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ uid: currentUser.uid }),
                });
                if (response.ok) {
                    const data = await response.json();
                    if (data.cancelAt) {
                        setCancelAt(data.cancelAt);
                    }
                }
            } catch (error) {
                console.error('Error fetching subscription status:', error);
            }
        };

        if (currentUser && currentUser.plan === 'premium') {
            fetchSubscriptionStatus();
        }
    }, [currentUser]);

    if (loading) {
        return <Loading />;
    }

    if (!currentUser) {
        return <div className="text-center py-10">ログインが必要です。ログインページへのンクを表示するなどの処理をここに追加。</div>;
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
                body: JSON.stringify({ refreshToken, currentUser })
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
                theme: selectedTheme, // 追加
            });
            setMessageInfo({ message: '設定が更新されました。', type: 'success' });
        } catch (error) {
            setMessageInfo({ message: '設定の更新に失敗しました。', type: 'error' });
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
            router.push('/');
        } catch (error) {

            alert('アカウントの削除に失敗しました。');
        }
    };

    const handleUnlinkYoutube = async () => {
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) {
            alert('ログインしていないため、連携を解除できません。');
            return;
        }

        try {
            const idToken = await user.getIdToken();
            const response = await fetch('/api/unlinkYoutube', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                },
                body: JSON.stringify({ uid: user.uid })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'YouTube連携の解除に失敗しました。');
            }

            setMessageInfo({ message: 'YouTubeとの連携が解除されました。', type: 'success' });
        } catch (error) {
            console.error('YouTube連携解エラー:', error);
            setMessageInfo({ message: `エラー: ${error.message}`, type: 'error' });
        }
    };

    const handlePublicPageSettingChange = async (key, value) => {
        const newSettings = {
            ...publicPageSettings,
            [key]: value
        };

        if (value === true && !publicPageSettings.pageId) {
            newSettings.pageId = crypto.randomUUID();
        }

        setPublicPageSettings(newSettings);

        try {
            const publicPageRef = doc(db, 'users', currentUser.uid, 'publicPages', 'settings');
            await setDoc(publicPageRef, newSettings);
            setMessageInfo({ message: '公開設定を更新しました', type: 'success' });
        } catch (error) {
            console.error('公開設定の更新エラー:', error);
            setMessageInfo({ message: '公開設定の更新に失敗しました', type: 'error' });
        }
    };

    const handleColumnVisibilityChange = async (columnKey, value) => {
        const newSettings = {
            ...publicPageSettings,
            visibleColumns: {
                ...publicPageSettings.visibleColumns,
                [columnKey]: value
            }
        };

        setPublicPageSettings(newSettings);

        try {
            const publicPageRef = doc(db, 'users', currentUser.uid, 'publicPages', 'settings');
            await setDoc(publicPageRef, newSettings);
            setMessageInfo({ message: '表示設定を更新しました', type: 'success' });
        } catch (error) {
            console.error('表示設定の更新エラー:', error);
            setMessageInfo({ message: '表示設定の更新に失敗しました', type: 'error' });
        }
    };

    const copyToClipboard = () => {
        const url = `${window.location.origin}/public/${publicPageSettings.pageId}`;
        navigator.clipboard.writeText(url);
        setMessageInfo({ message: 'URLをコピーしました', type: 'success' });
    };

    const handleLogout = async () => {
        const auth = getAuth();
        try {
            await signOut(auth);
            router.push('/');
        } catch (error) {
            console.error('ログアウトエラー:', error);
            setMessageInfo({ message: 'ログアウトに失敗しました。', type: 'error' });
        }
    };

    const handleUpgradePlan = async () => {
        const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

        const response = await fetch('/api/create-checkout-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ uid: currentUser.uid }),
        });

        const session = await response.json();

        await stripe.redirectToCheckout({ sessionId: session.id });
    };

    const handleCancelPlan = async () => {
        if (window.confirm(`本当にプレミアムプランをキャンセルしますか？\n(プランをキャンセルしても${new Date(currentUser.planUpdatedAt.toDate().getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}までは利用できます。)`)) {
            try {
                const response = await fetch('/api/cancel-subscription', {
                    method: 'POST',
                    body: JSON.stringify({ uid: currentUser.uid }),
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'サブスクリプションのキャンセルに失敗しました。');
                }

                const data = await response.json();
                setCancelAt(data.cancelAt);

                setMessageInfo({ message: data.message, type: 'success' });

            } catch (error) {
                setMessageInfo({ message: error.message, type: 'error' });
                console.error("Error cancelling subscription:", error);
            }
        }
    };

    return (
        <Layout>
            <div className="flex justify-between items-center p-8">
                <h1 className="text-2xl font-bold">設定</h1>
                <button onClick={handleLogout} className="text-red-500 hover:text-red-700 py-2 px-4 rounded inline-flex items-center">
                    <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
                    ログアウト
                </button>
            </div>
            <div className="flex">
                <div className="flex-grow p-8">
                    <div className='mb-6'>
                        <div className="mt-8 mb-8">
                            <label className="block mb-2 text-gray-700">プラン設定:</label>
                            <div className="bg-white shadow-md rounded px-5 py-3 flex justify-between items-center">
                                <p className="mr-4">現在のプラン: {currentUser.plan === 'premium' ? 'プレミアム' : 'フリー'}</p>
                                {currentUser.plan === 'free' ? (
                                    <button
                                        onClick={handleUpgradePlan}
                                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                                    >
                                        プレミアムプランにアップグレード
                                    </button>
                                ) : (
                                    <div className="flex items-center">
                                        {cancelAt ? (
                                            <p className="mr-4">プレミアムプランは {new Date(cancelAt).toLocaleDateString()} に自動解約されます</p>
                                        ) : (
                                            <p className="mr-4"></p>
                                        )}
                                        <button
                                            onClick={handleCancelPlan}
                                            className="text-red-500 hover:text-red-700 py-2 px-4 rounded"
                                        >
                                            プレミアムプランをキャンセル
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="mb-6">
                            <label className="block mb-2 text-gray-700">メールアドレス:</label>
                            <input type="email" className="border p-2 rounded w-full shadow-sm" value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>
                        <div className="mb-6">
                            <label className="block mb-2 text-gray-700">表示名:</label>
                            <input type="text" className="border p-2 rounded w-full shadow-sm" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
                        </div>
                        <div className="mb-6">
                            <label className="block mb-2 text-gray-700">テーマカラー:</label>
                            <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                                {[
                                    { name: 'blue', label: '水色', color: 'bg-customTheme-blue-primary' },
                                    { name: 'pink', label: 'ピンク', color: 'bg-customTheme-pink-primary' },
                                    { name: 'yellow', label: '黄色', color: 'bg-customTheme-yellow-primary' },
                                    { name: 'green', label: '緑', color: 'bg-customTheme-green-primary' },
                                    { name: 'orange', label: 'オレンジ', color: 'bg-customTheme-orange-primary' },
                                    { name: 'purple', label: '紫', color: 'bg-customTheme-purple-primary' },
                                    { name: 'black', label: '黒', color: 'bg-customTheme-black-primary' }
                                ].map((theme) => (
                                    <button
                                        key={theme.name}
                                        onClick={() => setSelectedTheme(theme.name)}
                                        className={`h-20 rounded-lg transition-transform ${theme.color} ${selectedTheme === theme.name ? 'ring-4 ring-offset-2 ring-blue-500 scale-105' : ''
                                            }`}
                                    >
                                        <span className="block text-center text-sm mt-2 text-white">{theme.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <label className="block mb-2 text-gray-700">Youtubeとの連携:</label>
                        <div className="bg-white shadow-md rounded px-5 py-3 flex flex-col md:flex-row justify-between items-center">
                            <div className="flex items-center justify-between w-full md:w-auto mb-4 md:mb-0">
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
                                        <div className="text-gray-700 text-sm">
                                            Youtubeと連携することで作成したセットリストをYoutubeの再生リストに追加することができます。
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {currentUser.youtubeRefreshToken ? (
                                <button onClick={handleUnlinkYoutube} className="mt-4 md:mt-0 block text-center bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                                    解除する
                                </button>
                            ) : (
                                <a href={authUrl} className="mt-4 md:mt-0 block text-center">
                                    <Image src={googleIcon} alt="Youtubeに接続" width={180} />
                                </a>
                            )}
                        </div>

                    </div>
                    <div className="mt-8 mb-8">
                        <label className="block mb-2 text-gray-700">持ち歌リストの公開設定:</label>
                        <div className="bg-white shadow-md rounded px-5 py-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <Switch
                                        checked={publicPageSettings.enabled}
                                        onChange={(checked) => handlePublicPageSettingChange('enabled', checked)}
                                    />
                                    <span>持ち歌リストを公開する</span>
                                </div>
                            </div>

                            {publicPageSettings.enabled && (
                                <div className="mt-4 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium">表示名</label>
                                        <input
                                            type="text"
                                            value={publicPageSettings.displayName}
                                            onChange={(e) => handlePublicPageSettingChange('displayName', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm py-2 px-3"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium">公開する情報</label>
                                        {columnLabels.map(({ key, label }) => (
                                            <div key={key} className="flex items-center mt-2">
                                                <Switch
                                                    checked={publicPageSettings.visibleColumns[key] || false}
                                                    onChange={(checked) => handleColumnVisibilityChange(key, checked)}
                                                />
                                                <span className="ml-2">{label}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium">公開ページURL</label>
                                        <div className="flex mt-1">
                                            <input
                                                type="text"
                                                value={`${window.location.origin}/public/${publicPageSettings.pageId}`}
                                                readOnly
                                                className="block w-full rounded-l-md border-gray-300 shadow-sm"
                                            />
                                            <button
                                                onClick={copyToClipboard}
                                                className="px-4 py-2 bg-gray-100 rounded-r-md border border-l-0"
                                            >
                                                <FontAwesomeIcon icon={faCopy} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex justify-between items-center">
                        <div>
                            <button onClick={() => setIsAccordionOpen(!isAccordionOpen)} className="text-black py-2 px-4 rounded text-sm flex items-center">
                                <FontAwesomeIcon icon={isAccordionOpen ? faChevronUp : faChevronDown} className="mr-2" />
                                その他の機能
                            </button>
                            {isAccordionOpen && (
                                <div className="mt-2">
                                    <button onClick={handleDeleteAccount} className="text-red-500 hover:text-red-700 py-2 px-4 rounded">
                                        アカウントを削除
                                    </button>
                                </div>
                            )}
                        </div>
                        <div>
                            <button onClick={handleUpdateProfile} className={`bg-customTheme-${theme}-primary hover:bg-customTheme-${theme}-accent text-white font-bold py-2 px-4 rounded`}>
                                更新
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}

export default Settings;
