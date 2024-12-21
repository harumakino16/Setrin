import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '@/context/AuthContext';
import { db } from '../../firebaseConfig';
import { updateDoc, doc, deleteDoc, getDoc, setDoc, onSnapshot, writeBatch, collection, getDocs, query, where } from 'firebase/firestore';
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
import H1 from '@/components/ui/h1';
import { handleUpgradePlan } from '@/utils/stripeUtils';
import Modal from '@/components/Modal';
import Price from '@/components/Price';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';


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
    const [isModalOpen, setIsModalOpen] = useState(false);

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
                theme: selectedTheme, // テーマの更新
            });

            // トップレベルpublicPagesからuserIdが一致するドキュメントのcolorフィールドを更新
            const topLevelPublicPagesRef = collection(db, 'publicPages');
            const q = query(topLevelPublicPagesRef, where('userId', '==', currentUser.uid));
            const topLevelPublicPagesSnapshot = await getDocs(q);
            const topLevelBatch = writeBatch(db);
            topLevelPublicPagesSnapshot.forEach((doc) => {
                topLevelBatch.update(doc.ref, { color: selectedTheme });
            });
            await topLevelBatch.commit();

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

    const handleUpgradePlanClick = () => {
        if (currentUser) {
            handleUpgradePlan(currentUser);
        } else {
            alert('ログインが必要です。');
        }
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
            <div className="flex justify-between items-center p-8 pb-4 border-b">
                <H1>設定</H1>
                <button 
                    onClick={handleLogout} 
                    className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors duration-200 py-2 px-4 rounded-lg hover:bg-red-50"
                >
                    <FontAwesomeIcon icon={faSignOutAlt} />
                    <span>ログアウト</span>
                </button>
            </div>

            <div className="max-w-4xl mx-auto p-8">
                <section className="mb-12">
                    <h2 className="text-xl font-bold mb-4">プラン設定</h2>
                    <div className="bg-white shadow-lg rounded-lg p-6">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                            <div>
                                <p className="text-lg font-medium">
                                    現在のプラン: 
                                    <span className={`ml-2 ${currentUser.plan === 'premium' ? 'text-green-600' : 'text-gray-600'}`}>
                                        {currentUser.plan === 'premium' ? 'プレミアム' : 'フリー'}
                                    </span>
                                </p>
                                {cancelAt && (
                                    <p className="text-sm text-gray-600">
                                        プレミアムプランは {new Date(cancelAt).toLocaleDateString()} に自動解約されます
                                    </p>
                                )}
                            </div>
                            {currentUser.plan === 'free' ? (
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
                                >
                                    プレミアムプランにアップグレード
                                </button>
                            ) : (
                                <button
                                    onClick={handleCancelPlan}
                                    className="text-red-500 hover:text-red-700 py-2 px-4 rounded-lg border border-red-500 hover:bg-red-50 transition-colors duration-200"
                                >
                                    プレミアムプランをキャンセル
                                </button>
                            )}
                        </div>
                    </div>
                </section>

                <section className="mb-12">
                    <h2 className="text-xl font-bold mb-4">プロフィール設定</h2>
                    <div className="bg-white shadow-lg rounded-lg p-6 space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">メールアドレス</label>
                            <input 
                                type="email" 
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">表示名</label>
                            <input 
                                type="text" 
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
                                value={displayName} 
                                onChange={(e) => setDisplayName(e.target.value)} 
                            />
                        </div>
                    </div>
                </section>

                <section className="mb-12">
                    <h2 className="text-xl font-bold mb-4">テーマ設定</h2>
                    <div className="bg-white shadow-lg rounded-lg p-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                                    className={`
                                        relative h-24 rounded-xl transition-all duration-200 
                                        ${theme.color} 
                                        ${selectedTheme === theme.name ? 'ring-4 ring-offset-2 ring-blue-500 scale-105' : 'hover:scale-105'}
                                    `}
                                >
                                    <span className="absolute inset-0 flex items-center justify-center text-white font-medium">
                                        {theme.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="mb-12">
                    <h2 className="text-xl font-bold mb-4">YouTube連携</h2>
                    <div className="bg-white shadow-lg rounded-lg p-6">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <Image 
                                    src={youtubeIcon} 
                                    alt="YouTube" 
                                    width={50} 
                                    className="rounded-lg"
                                    priority={true} 
                                />
                                <div>
                                    {currentUser.youtubeRefreshToken ? (
                                        <div className="flex items-center mb-2">
                                            <svg className="w-5 h-5 text-green-500 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                                                <path d="M5 13l4 4L19 7"></path>
                                            </svg>
                                            <span className="text-green-600 font-medium">連携中</span>
                                        </div>
                                    ) : (
                                        <p className="text-red-500 font-medium mb-2">未連携</p>
                                    )}
                                    <p className="text-sm text-gray-600">
                                        YouTubeと連携してセットリストを再生リストとして活用できます
                                    </p>
                                </div>
                            </div>
                            {currentUser.youtubeRefreshToken ? (
                                <button 
                                    onClick={handleUnlinkYoutube}
                                    className="whitespace-nowrap px-6 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition-colors duration-200"
                                >
                                    連携を解除
                                </button>
                            ) : (
                                <a 
                                    href={authUrl}
                                    className="transform hover:scale-105 transition-transform duration-200"
                                >
                                    <Image 
                                        src={googleIcon} 
                                        alt="YouTubeに接続" 
                                        width={180} 
                                        priority={true} 
                                    />
                                </a>
                            )}
                        </div>
                    </div>
                </section>

                <div className="flex justify-between items-center pt-4 border-t">
                    <button 
                        onClick={() => setIsAccordionOpen(!isAccordionOpen)}
                        className="text-gray-600 hover:text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors duration-200 flex items-center gap-2"
                    >
                        <FontAwesomeIcon icon={isAccordionOpen ? faChevronUp : faChevronDown} />
                        その他の機能
                    </button>
                    <button 
                        onClick={handleUpdateProfile}
                        className={`
                            bg-customTheme-${theme}-primary hover:bg-customTheme-${theme}-accent 
                            text-white font-bold py-3 px-8 rounded-lg
                            transition-all duration-200 transform hover:scale-105
                        `}
                    >
                        設定を保存
                    </button>
                </div>
                
                {isAccordionOpen && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <button 
                            onClick={handleDeleteAccount}
                            className="text-red-500 hover:text-red-700 py-2 px-4 rounded-lg hover:bg-red-50 transition-colors duration-200"
                        >
                            アカウントを削除
                        </button>
                    </div>
                )}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <Price />
            </Modal>
        </Layout>
    );
}

export default Settings;

// ページで翻訳データを取得する部分
export async function getStaticProps({ locale }) {
    return {
        props: {
            ...(await serverSideTranslations(locale, ['common'])),
        },
    };
}
