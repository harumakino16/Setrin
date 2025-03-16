// pages/request-utawaku.jsx

import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';
import Layout from '@/pages/layout';
import { db } from '@/../firebaseConfig';
import { collection, doc, getDocs, getDoc, setDoc, onSnapshot, updateDoc, query, where, increment, serverTimestamp } from 'firebase/firestore';
import { useTheme } from '@/context/ThemeContext';
import { useMessage } from '@/context/MessageContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy, faQuestionCircle, faSort, faSortUp, faSortDown, faEye } from '@fortawesome/free-solid-svg-icons';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import H1 from '@/components/ui/h1';
import BackButton from '@/components/BackButton';
import HowToUseRequestModal from '@/components/request/HowToUseRequestModal';
import PremiumCheck from '@/components/PremiumCheck';

export default function RequestUtawaku() {
    const { currentUser } = useContext(AuthContext);
    const { theme } = useTheme();
    const { setMessageInfo } = useMessage();
    const [showHowToUse, setShowHowToUse] = useState(false);

    const [publicPages, setPublicPages] = useState([]);
    const [selectedPageId, setSelectedPageId] = useState('');
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [requestMode, setRequestMode] = useState(false);
    const [sortConfig, setSortConfig] = useState({
        key: 'requestedAt',
        direction: 'desc',
        showConsumedAtBottom: false
    });

    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [songInfo, setSongInfo] = useState(null);

    // ソート関数
    const sortRequests = (reqs) => {
        let sortedReqs = [...reqs];
        
        sortedReqs.sort((a, b) => {
            // 消化済みを下に表示する設定が有効な場合、最優先で適用
            if (sortConfig.showConsumedAtBottom) {
                if (a.consumed && !b.consumed) return 1;
                if (!a.consumed && b.consumed) return -1;
            }

            // 同じ消化状態の場合は、選択されたカラムでソート
            if (sortConfig.key === 'requestedAt') {
                const dateA = a.requestedAt?.toDate() || new Date(0);
                const dateB = b.requestedAt?.toDate() || new Date(0);
                return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
            }
            if (sortConfig.key === 'songTitle') {
                return sortConfig.direction === 'asc' 
                    ? a.songTitle.localeCompare(b.songTitle)
                    : b.songTitle.localeCompare(a.songTitle);
            }
            if (sortConfig.key === 'requesterName') {
                const nameA = a.requesterName || '匿名';
                const nameB = b.requesterName || '匿名';
                return sortConfig.direction === 'asc'
                    ? nameA.localeCompare(nameB)
                    : nameB.localeCompare(nameA);
            }
            if (sortConfig.key === 'isFirstTime') {
                return sortConfig.direction === 'asc'
                    ? (a.isFirstTime === b.isFirstTime ? 0 : a.isFirstTime ? 1 : -1)
                    : (a.isFirstTime === b.isFirstTime ? 0 : a.isFirstTime ? -1 : 1);
            }
            return 0;
        });

        return sortedReqs;
    };

    // ソート処理のハンドラー
    const handleSort = (key) => {
        setSortConfig(prev => ({
            ...prev,
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    // 消化済みを下に表示する設定の切り替え
    const toggleConsumedAtBottom = () => {
        setSortConfig(prev => ({
            ...prev,
            showConsumedAtBottom: !prev.showConsumedAtBottom
        }));
    };

    const [pageName, setPageName] = useState('');
    const [publicURL, setPublicURL] = useState('');
    const [ownerUserId, setOwnerUserId] = useState('');
    const [notificationEnabled, setNotificationEnabled] = useState(false);
    const { t } = useTranslation('common');

    useEffect(() => {
        if (!currentUser) return;
        const fetchPublicPages = async () => {
            const pagesRef = collection(db, 'users', currentUser.uid, 'publicPages');
            const pagesSnapshot = await getDocs(pagesRef);
            const pagesData = pagesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setPublicPages(pagesData);
            setLoading(false);

            // 公開ページがあれば最初をデフォルト選択
            if (pagesData.length > 0) {
                const firstPage = pagesData[0];
                setSelectedPageId(firstPage.id);
                if (typeof window !== 'undefined') {
                    setPublicURL(`${window.location.origin}/public/${firstPage.id}`);
                }
            }
        };
        fetchPublicPages();
    }, [currentUser]);

    useEffect(() => {
        if (!currentUser || !selectedPageId) return;

        async function fetchPageData() {
            const topLevelRef = doc(db, 'publicPages', selectedPageId);
            const topLevelDoc = await getDoc(topLevelRef);
            if (!topLevelDoc.exists()) return;
            const topData = topLevelDoc.data();
            const userId = topData.userId;
            setOwnerUserId(userId);

            const pageRef = doc(db, 'users', userId, 'publicPages', selectedPageId);
            const pageDoc = await getDoc(pageRef);
            if (pageDoc.exists()) {
                const data = pageDoc.data();
                setRequestMode(data.requestMode || false);
                setPageName(data.name || '名称未設定...');
                if (typeof window !== 'undefined') {
                    setPublicURL(`${window.location.origin}/public/${selectedPageId}`);
                }

                const requestsRef = collection(db, 'users', userId, 'publicPages', selectedPageId, 'requests');
                const q = query(requestsRef, where('publicPageId', '==', selectedPageId));
                const unsubscribe = onSnapshot(q, (snapshot) => {
                    const reqData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setRequests(sortRequests(reqData));
                });

                return () => unsubscribe();
            }
        }

        const unsub = fetchPageData();
        return () => {
            if (typeof unsub === 'function') unsub();
        };
    }, [currentUser, selectedPageId]);

    useEffect(() => {
        if (!currentUser) return;
        // 通知設定を取得
        const fetchNotificationSettings = async () => {
            const userRef = doc(db, 'users', currentUser.uid);
            const userDoc = await getDoc(userRef);
            if (userDoc.exists()) {
                const settings = userDoc.data().notificationSettings || {};
                setNotificationEnabled(settings.requestNotification || false);
            }
        };
        fetchNotificationSettings();
    }, [currentUser]);

    const handleToggleRequestMode = async () => {
        if (!currentUser || !selectedPageId || !ownerUserId) return;
        const pageRef = doc(db, 'users', ownerUserId, 'publicPages', selectedPageId);

        // 現在のモードを切り替え → requestMode
        await updateDoc(pageRef, {
            requestMode: !requestMode
        });

        // ▼ もしこれが「リクエスト歌枠を開始する」動作に相当するなら
        if (!requestMode === true) {
            // OFF → ON になった(開始された)
            const userRef = doc(db, 'users', currentUser.uid);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                const data = userSnap.data().userActivity || {};
                const lastTime = data.lastUtawakuSessionTime
                    ? data.lastUtawakuSessionTime.toDate()
                    : null;

                const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);
                // 3時間以上経過していなければ incrementしない
                if (!lastTime || lastTime < threeHoursAgo) {
                    await updateDoc(userRef, {
                        'userActivity.requestUtawakuCount': increment(1),
                        'userActivity.monthlyRequestUtawakuCount': increment(1),
                        'userActivity.lastUtawakuSessionTime': serverTimestamp(),
                        'userActivity.lastActivityAt': serverTimestamp(),
                    });
                } else {
                    // 3時間未満の場合は timeStamp だけ更新するかどうかは要件次第
                    await updateDoc(userRef, {
                        'userActivity.lastActivityAt': serverTimestamp(),
                    });
                }
            }
        }

        setRequestMode(!requestMode);
        setMessageInfo({ type: 'success', message: `リクエスト受付を${!requestMode ? '開始' : '停止'}しました。` });
    };

    const handleConsumeRequest = async (requestId, currentStatus) => {
        if (!selectedPageId || !requestId || !ownerUserId) return;
        const requestRef = doc(db, 'users', ownerUserId, 'publicPages', selectedPageId, 'requests', requestId);
        await setDoc(requestRef, { consumed: !currentStatus }, { merge: true });
        setMessageInfo({ 
            type: 'success', 
            message: currentStatus ? 'リクエストを未消化に戻しました。' : 'リクエストを消化しました。'
        });
    };

    const handleCopyURL = () => {
        if (typeof window !== 'undefined') {
            navigator.clipboard.writeText(publicURL);
            setMessageInfo({ type: 'success', message: 'URLをコピーしました。' });
        }
    };

    const handleToggleNotification = async () => {
        if (!currentUser || !selectedPageId) return;
        const pageRef = doc(db, 'users', currentUser.uid, 'publicPages', selectedPageId);
        await updateDoc(pageRef, {
            'notificationSettings.requestNotification': !notificationEnabled,
            'notificationSettings.email': currentUser.email
        });
        setNotificationEnabled(!notificationEnabled);
        setMessageInfo({
            type: 'success',
            message: `リクエスト通知を${!notificationEnabled ? 'オン' : 'オフ'}にしました。`
        });
    };

    // 曲情報を取得する関数
    const fetchSongInfo = async (userId, songId) => {
        if (!userId || !songId) {
            console.log('Missing userId or songId:', { userId, songId });
            return;
        }
        try {
            console.log('Fetching song info:', { userId, songId });
            // songIdが小文字で来る可能性があるので、大文字に変換
            const songRef = doc(db, 'users', userId, 'Songs', songId.toString());
            const songDoc = await getDoc(songRef);
            console.log('Song doc exists:', songDoc.exists(), songDoc.data());
            if (songDoc.exists()) {
                setSongInfo(songDoc.data());
            }
        } catch (error) {
            console.error('Error fetching song info:', error);
            setMessageInfo({ type: 'error', message: '曲情報の取得に失敗しました。' });
        }
    };

    // モーダルを開く時に曲情報も取得
    const handleOpenDetail = async (req) => {
        console.log('Opening detail for request:', req);
        setSelectedRequest(req);
        setShowDetailModal(true);
        setSongInfo(null); // リセット
        if (req.songId && ownerUserId) {
            await fetchSongInfo(ownerUserId, req.songId);
        } else {
            console.log('Missing songId or ownerUserId:', { songId: req.songId, ownerUserId });
        }
    };

    // モーダルを閉じる時
    const handleCloseDetail = () => {
        setShowDetailModal(false);
        setSelectedRequest(null);
        setSongInfo(null);
    };

    if (!currentUser) {
        return (
            <Layout>
                <div className="p-8">
                    <p className="text-gray-700">ログインしてください。</p>
                </div>
            </Layout>
        );
    }

    if (loading) {
        return (
            <Layout>
                <div className="p-8">読み込み中...</div>
            </Layout>
        );
    }

    return (
        <PremiumCheck>
            <Layout>
                <div className="p-8 space-y-8 max-w-4xl mx-auto">
                    {/* ヘッダーセクション */}
                    <div className="space-y-2">
                        <BackButton text="ツール一覧に戻る" href="/utawakutool" />
                        <div className="flex justify-between items-center">
                            <H1>リクエスト歌枠管理</H1>
                            <button
                                onClick={() => setShowHowToUse(true)}
                                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
                            >
                                <FontAwesomeIcon icon={faQuestionCircle} />
                                <span className="text-sm">使い方を見る</span>
                            </button>
                        </div>
                    </div>

                    {/* 使い方モーダル */}
                    <HowToUseRequestModal
                        isOpen={showHowToUse}
                        onClose={() => setShowHowToUse(false)}
                    />

                    {/* 公開ページ選択セクション */}
                    <div className="bg-white p-6 rounded shadow-sm space-y-4">
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 mb-2">公開ページ選択</h2>
                            <p className="text-sm text-gray-600">どの公開ページのリクエストを管理しますか？</p>
                        </div>

                        <div className="space-y-2">
                            <div className="flex flex-col md:flex-row gap-4 m-0">
                                <div className="flex-grow">
                                    <p className="text-gray-700 text-sm font-semibold mb-1">公開ページ</p>
                                    <select
                                        value={selectedPageId}
                                        onChange={(e) => {
                                            setSelectedPageId(e.target.value);
                                            if (typeof window !== 'undefined') {
                                                setPublicURL(`${window.location.origin}/public/${e.target.value}`);
                                            }
                                        }}
                                        className="border border-gray-300 rounded px-3 py-2 w-full"
                                    >
                                        {publicPages.length === 0 ? (
                                            <option disabled>公開ページがありません</option>
                                        ) : (
                                            publicPages.map((page) => (
                                                <option key={page.id} value={page.id}>
                                                    {page.name || '名称未設定...'}
                                                </option>
                                            ))
                                        )}
                                    </select>
                                    {publicPages.length === 0 && (
                                        <Link href="/pubpagesetting" className="text-blue-500 hover:underline">
                                            +公開ページを作成する
                                        </Link>
                                    )}
                                </div>

                                <div className="flex-grow">
                                    <p className="text-gray-700 text-sm font-semibold mb-1">リスナー共有用URL</p>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={publicURL}
                                            readOnly
                                            className="border p-2 rounded w-full text-gray-700"
                                        />
                                        <button
                                            onClick={handleCopyURL}
                                            className="px-4 py-2 bg-gray-100 rounded-r-md border border-l-0 hover:bg-gray-200 transition-colors"
                                            title="URLをコピー"
                                        >
                                            <FontAwesomeIcon icon={faCopy} />
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">このURLをリスナーに共有すると、リクエストを受け付けられます。</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {selectedPageId && (
                        <div className="space-y-8">
                            {/* リクエスト受付モード */}
                            <div className="bg-white p-6 rounded shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-bold text-gray-800">
                                        {pageName || '名称未設定...'}
                                    </h2>
                                    <div className="flex items-center space-x-3">
                                        <span className="text-sm font-semibold text-gray-700">
                                            {requestMode ? 'リクエスト受付中' : 'リクエスト停止中'}
                                        </span>
                                        <button
                                            onClick={handleToggleRequestMode}
                                            className={`relative inline-flex items-center cursor-pointer 
                                            ${requestMode ? 'bg-green-500' : 'bg-gray-300'} 
                                            w-16 h-8 rounded-full transition-colors duration-300 focus:outline-none`}
                                            title="リクエスト受付を切り替え"
                                        >
                                            <span
                                                className={`inline-block w-6 h-6 bg-white rounded-full transform transition-transform duration-300 
                                                ${requestMode ? 'translate-x-9' : 'translate-x-1'}`}
                                            />
                                        </button>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600">
                                    リクエスト受付中にするとリスナーは指定された公開ページから好きな曲をリクエストできます。
                                    停止中はリスナー側のリクエストボタンが消えます。
                                </p>
                            </div>

                            {/* 通知設定セクション */}
                            <div className="bg-white p-6 rounded shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-800 mb-2">メール通知</h2>
                                        <p className="text-sm text-gray-600">新しいリクエストが届いた時にメールで通知します</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={notificationEnabled}
                                            onChange={handleToggleNotification}
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>
                            </div>

                            {/* リクエスト一覧 */}
                            <div className="bg-white p-6 rounded shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <h3 className="text-lg font-semibold text-gray-800">リクエスト一覧</h3>
                                        <button
                                            onClick={toggleConsumedAtBottom}
                                            className={`px-3 py-1 text-sm rounded ${
                                                sortConfig.showConsumedAtBottom
                                                    ? 'bg-blue-100 text-blue-700'
                                                    : 'bg-gray-100 text-gray-700'
                                            } hover:bg-opacity-80 transition-colors`}
                                        >
                                            消化済みを下へ
                                        </button>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        {requests.length}件のリクエスト
                                    </p>
                                </div>

                                {requests.length === 0 ? (
                                    <div className="flex flex-col items-center space-y-4 py-8">
                                        <p className="text-gray-600 text-sm">
                                            まだリクエストは届いていません。<br />
                                            リスナーにURLを共有してリクエストを募りましょう。
                                        </p>
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200 text-sm whitespace-nowrap">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th 
                                                            className="px-4 py-2 text-left font-bold text-gray-500 uppercase cursor-pointer hover:bg-gray-100 min-w-[180px] max-w-[300px]"
                                                            onClick={() => handleSort('songTitle')}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                曲名
                                                                <FontAwesomeIcon 
                                                                    icon={
                                                                        sortConfig.key === 'songTitle'
                                                                            ? sortConfig.direction === 'asc'
                                                                                ? faSortUp
                                                                                : faSortDown
                                                                            : faSort
                                                                    }
                                                                />
                                                            </div>
                                                        </th>
                                                        <th className="px-4 py-2 text-left font-bold text-gray-500 uppercase min-w-[50px]">詳細</th>
                                                        <th 
                                                            className="px-4 py-2 text-left font-bold text-gray-500 uppercase cursor-pointer hover:bg-gray-100 min-w-[120px]"
                                                            onClick={() => handleSort('requesterName')}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                送信者
                                                                <FontAwesomeIcon 
                                                                    icon={
                                                                        sortConfig.key === 'requesterName'
                                                                            ? sortConfig.direction === 'asc'
                                                                                ? faSortUp
                                                                                : faSortDown
                                                                            : faSort
                                                                    }
                                                                />
                                                            </div>
                                                        </th>
                                                        <th 
                                                            className="px-4 py-2 text-left font-bold text-gray-500 uppercase cursor-pointer hover:bg-gray-100 min-w-[80px]"
                                                            onClick={() => handleSort('isFirstTime')}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                初見
                                                                <FontAwesomeIcon 
                                                                    icon={
                                                                        sortConfig.key === 'isFirstTime'
                                                                            ? sortConfig.direction === 'asc'
                                                                                ? faSortUp
                                                                                : faSortDown
                                                                            : faSort
                                                                    }
                                                                />
                                                            </div>
                                                        </th>
                                                        <th 
                                                            className="px-4 py-2 text-left font-bold text-gray-500 uppercase cursor-pointer hover:bg-gray-100 min-w-[160px]"
                                                            onClick={() => handleSort('requestedAt')}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                時刻
                                                                <FontAwesomeIcon 
                                                                    icon={
                                                                        sortConfig.key === 'requestedAt'
                                                                            ? sortConfig.direction === 'asc'
                                                                                ? faSortUp
                                                                                : faSortDown
                                                                            : faSort
                                                                    }
                                                                />
                                                            </div>
                                                        </th>
                                                        <th className="px-4 py-2 text-left font-bold text-gray-500 uppercase min-w-[100px]">ステータス</th>
                                                        <th className="sticky right-0 px-4 py-2 text-left font-bold text-gray-500 uppercase text-center min-w-[80px] bg-gray-50">消化する</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {sortRequests(requests).map((req) => {
                                                        const requestedAt = req.requestedAt?.toDate();
                                                        const timeStr = requestedAt
                                                            ? requestedAt.toLocaleString('ja-JP', {
                                                                year: 'numeric',
                                                                month: 'numeric',
                                                                day: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                                second: '2-digit'
                                                            })
                                                            : '不明';
                                                        const isConsumed = req.consumed;
                                                        return (
                                                            <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                                                                <td className="px-4 py-2 text-gray-700 truncate max-w-[200px]" title={req.songTitle}>
                                                                    {req.youtubeUrl ? (
                                                                        <Link href={req.youtubeUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline truncate block" title={req.songTitle}>{req.songTitle}</Link>
                                                                    ) : (
                                                                        <span className="truncate block" title={req.songTitle}>{req.songTitle}</span>
                                                                    )}
                                                                </td>
                                                                <td className="px-4 py-2">
                                                                    <button
                                                                        onClick={() => handleOpenDetail(req)}
                                                                        className="text-gray-500 hover:text-gray-700 transition-colors"
                                                                    >
                                                                        <FontAwesomeIcon icon={faEye} />
                                                                    </button>
                                                                </td>
                                                                <td className="px-4 py-2 text-gray-700 truncate max-w-[130px]" title={req.requesterName || '匿名'}>
                                                                    <span className="truncate block">{req.requesterName || '匿名'}</span>
                                                                </td>
                                                                <td className="px-4 py-2 text-gray-700">{req.isFirstTime ? '初見' : '常連'}</td>
                                                                <td className="px-4 py-2 text-gray-700">{timeStr}</td>
                                                                <td className="px-4 py-2">
                                                                    {isConsumed ? (
                                                                        <span className="inline-block px-2 py-1 text-xs text-white bg-gray-500 rounded">消化済み</span>
                                                                    ) : (
                                                                        <span className="inline-block px-2 py-1 text-xs text-white bg-green-500 rounded">未消化</span>
                                                                    )}
                                                                </td>
                                                                <td className="sticky right-0 px-4 text-center py-2 text-gray-700 bg-white">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={isConsumed}
                                                                        onChange={() => handleConsumeRequest(req.id, isConsumed)}
                                                                        className="form-checkbox h-5 w-5 text-blue-600 transition duration-150 ease-in-out"
                                                                    />
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {/* 詳細情報モーダル */}
                                {showDetailModal && selectedRequest && (
                                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                        <div className="bg-white rounded-lg p-8 max-w-xl w-full mx-4 relative overflow-y-auto max-h-[90vh]">
                                            <button
                                                onClick={handleCloseDetail}
                                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                                            >
                                                <span className="text-xl">✕</span>
                                            </button>

                                            {/* タイトルと曲名 */}
                                            <div className="mb-6">
                                                <h3 className="text-2xl font-bold text-gray-800 mb-2">{selectedRequest.songTitle}</h3>
                                                {songInfo?.furigana && (
                                                    <p className="text-sm text-gray-500">{songInfo.furigana}</p>
                                                )}
                                            </div>

                                            <div className="mb-6">
                                                <h4 className="text-lg font-semibold text-gray-700 border-b pb-2">登録曲情報</h4>
                                            </div>

                                            {/* 曲情報セクション */}
                                            {songInfo ? (
                                                <div className="space-y-6">
                                                    {/* 基本情報 */}
                                                    <div className="grid grid-cols-2 gap-4">
                                                        {/* アーティスト */}
                                                        <div className="bg-gray-50 rounded-lg p-4">
                                                            <h4 className="text-sm font-semibold text-gray-600 mb-1">アーティスト</h4>
                                                            <p className="text-gray-700">
                                                                {songInfo.artist || <span className="text-gray-400">未設定</span>}
                                                            </p>
                                                        </div>
                                                        {/* ジャンル */}
                                                        <div className="bg-gray-50 rounded-lg p-4">
                                                            <h4 className="text-sm font-semibold text-gray-600 mb-1">ジャンル</h4>
                                                            <p className="text-gray-700">
                                                                {songInfo.genre || <span className="text-gray-400">未設定</span>}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* YouTube URL */}
                                                    {songInfo.youtubeUrl && (
                                                        <div className="bg-gray-50 rounded-lg p-4">
                                                            <h4 className="text-sm font-semibold text-gray-600 mb-1">YouTube URL</h4>
                                                            <a
                                                                href={songInfo.youtubeUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-blue-600 hover:text-blue-800 hover:underline break-all"
                                                            >
                                                                {songInfo.youtubeUrl}
                                                            </a>
                                                        </div>
                                                    )}

                                                    {/* 歌唱情報 */}
                                                    <div className="grid grid-cols-2 gap-4">
                                                        {/* 歌った回数 */}
                                                        <div className="bg-gray-50 rounded-lg p-4">
                                                            <h4 className="text-sm font-semibold text-gray-600 mb-1">歌った回数</h4>
                                                            <p className="text-gray-700">
                                                                {songInfo.singingCount ? `${songInfo.singingCount}回` : <span className="text-gray-400">0回</span>}
                                                            </p>
                                                        </div>
                                                        {/* 熟練度 */}
                                                        <div className="bg-gray-50 rounded-lg p-4">
                                                            <h4 className="text-sm font-semibold text-gray-600 mb-1">熟練度</h4>
                                                            <p className="text-gray-700">
                                                                {songInfo.skillLevel || <span className="text-gray-400">未設定</span>}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* タグセクション */}
                                                    <div>
                                                        <h4 className="text-sm font-semibold text-gray-600 mb-2">タグ</h4>
                                                        <div className="flex flex-wrap gap-2">
                                                            {songInfo.tags && songInfo.tags.length > 0 ? (
                                                                songInfo.tags.map((tag, index) => (
                                                                    <span key={index} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-medium">
                                                                        {tag}
                                                                    </span>
                                                                ))
                                                            ) : (
                                                                <span className="text-gray-400">未設定</span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* メモセクション */}
                                                    <div className="bg-gray-50 rounded-lg p-4">
                                                        <h4 className="text-sm font-semibold text-gray-600 mb-2">メモ</h4>
                                                        <p className="text-gray-700 whitespace-pre-wrap">
                                                            {songInfo.memo || <span className="text-gray-400">未設定</span>}
                                                        </p>
                                                    </div>

                                                    {/* 備考セクション */}
                                                    <div className="bg-gray-50 rounded-lg p-4">
                                                        <h4 className="text-sm font-semibold text-gray-600 mb-2">備考</h4>
                                                        <p className="text-gray-700 whitespace-pre-wrap">
                                                            {songInfo.note || <span className="text-gray-400">未設定</span>}
                                                        </p>
                                                    </div>

                                                    {/* 日付情報 */}
                                                    <div className="bg-gray-50 rounded-lg p-4">
                                                        <h4 className="text-sm font-semibold text-gray-600 mb-1">登録日</h4>
                                                        <p className="text-gray-700">
                                                            {songInfo.createdAt ? (
                                                                songInfo.createdAt.toDate().toLocaleDateString('ja-JP')
                                                            ) : (
                                                                <span className="text-gray-400">未設定</span>
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-center py-8 text-gray-500">
                                                    登録済みの曲情報はありません
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </Layout>
        </PremiumCheck>
    );
}

// ページで翻訳データを取得する部分
export async function getStaticProps({ locale }) {
    return {
        props: {
            ...(await serverSideTranslations(locale, ['common'])),
        },
    };
}
