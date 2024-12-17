// pages/request-utawaku.jsx

import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';
import Layout from '@/pages/layout';
import { db } from '@/../firebaseConfig';
import { collection, doc, getDocs, getDoc, setDoc, onSnapshot, updateDoc, query, where } from 'firebase/firestore';
import { useTheme } from '@/context/ThemeContext';
import { useMessage } from '@/context/MessageContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy } from '@fortawesome/free-solid-svg-icons';
import Image from 'next/image';

export default function RequestUtawaku() {
    const { currentUser } = useContext(AuthContext);
    const { theme } = useTheme();
    const { setMessageInfo } = useMessage();

    const [publicPages, setPublicPages] = useState([]);
    const [selectedPageId, setSelectedPageId] = useState('');
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [requestMode, setRequestMode] = useState(false);
    const [pageName, setPageName] = useState('');
    const [publicURL, setPublicURL] = useState('');
    const [ownerUserId, setOwnerUserId] = useState('');

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

                const requestsRef = collection(db, 'users', userId, 'requests');
                const q = query(requestsRef, where('publicPageId', '==', selectedPageId));
                const unsubscribe = onSnapshot(q, (snapshot) => {
                    const reqData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    reqData.sort((a, b) => b.requestedAt?.toDate() - a.requestedAt?.toDate());
                    setRequests(reqData);
                });

                return () => unsubscribe();
            }
        }

        const unsub = fetchPageData();
        return () => {
            if (typeof unsub === 'function') unsub();
        };
    }, [currentUser, selectedPageId]);

    const handleToggleRequestMode = async () => {
        if (!currentUser || !selectedPageId || !ownerUserId) return;
        const pageRef = doc(db, 'users', ownerUserId, 'publicPages', selectedPageId);
        await updateDoc(pageRef, {
            requestMode: !requestMode
        });
        setRequestMode(!requestMode);
        setMessageInfo({ type: 'success', message: `リクエスト受付を${!requestMode ? '開始' : '停止'}しました。` });
    };

    const handleConsumeRequest = async (requestId) => {
        if (!selectedPageId || !requestId || !ownerUserId) return;
        const requestRef = doc(db, 'users', ownerUserId, 'requests', requestId);
        await setDoc(requestRef, { consumed: true }, { merge: true });
        setMessageInfo({ type: 'success', message: 'リクエストを消化しました。' });
    };

    const handleCopyURL = () => {
        if (typeof window !== 'undefined') {
            navigator.clipboard.writeText(publicURL);
            setMessageInfo({ type: 'success', message: 'URLをコピーしました。' });
        }
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
        <Layout>
            <div className="p-8 space-y-8 max-w-4xl mx-auto">
                {/* ヘッダーセクション */}
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold text-gray-800">リクエスト歌枠管理</h1>
                    <p className="text-gray-600 text-sm">
                        ここではリスナーからのリクエスト状況をリアルタイムで監視・管理できます。
                        リクエスト受付のオン/オフ切り替えや、リクエストの消化が可能です。
                    </p>
                </div>

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
                                {publicPages.length === 0 && <option>公開ページがありません</option>}
                                {publicPages.map((page) => (
                                    <option key={page.id} value={page.id}>
                                        {page.name || '名称未設定...'}
                                    </option>
                                ))}
                            </select>
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

                        {/* リクエスト一覧 */}
                        <div className="bg-white p-6 rounded shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-800">リクエスト一覧</h3>
                                <p className="text-sm text-gray-600">
                                    {requests.length}件のリクエスト
                                </p>
                            </div>

                            {requests.length === 0 ? (
                                <div className="flex flex-col items-center space-y-4 py-8">
                                    <p className="text-gray-600 text-sm">
                                        まだリクエストは届いていません。<br/>
                                        リスナーにURLを共有してリクエストを募りましょう。
                                    </p>
                                </div>
                            ) : (
                                <table className="min-w-full divide-y divide-gray-200 text-sm">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-2 text-left font-bold text-gray-500 uppercase">曲名</th>
                                            <th className="px-4 py-2 text-left font-bold text-gray-500 uppercase">送信者</th>
                                            <th className="px-4 py-2 text-left font-bold text-gray-500 uppercase">時刻</th>
                                            <th className="px-4 py-2 text-left font-bold text-gray-500 uppercase">ステータス</th>
                                            <th className="px-4 py-2 text-left font-bold text-gray-500 uppercase">消化する</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {requests.map((req) => {
                                            const requestedAt = req.requestedAt?.toDate();
                                            const timeStr = requestedAt
                                                ? requestedAt.toLocaleString('ja-JP', {
                                                    year: 'numeric',
                                                    month: 'numeric',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                    second:'2-digit'
                                                  })
                                                : '不明';
                                            const isConsumed = req.consumed;
                                            return (
                                                <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-4 py-2 text-gray-700 max-w-[200px] truncate" title={req.songTitle}>{req.songTitle}</td>
                                                    <td className="px-4 py-2 text-gray-700">{req.requesterName || '匿名'}</td>
                                                    <td className="px-4 py-2 text-gray-700 whitespace-nowrap">{timeStr}</td>
                                                    <td className="px-4 py-2">
                                                        {isConsumed ? (
                                                            <span className="inline-block px-2 py-1 text-xs text-white bg-gray-500 rounded">消化済み</span>
                                                        ) : (
                                                            <span className="inline-block px-2 py-1 text-xs text-white bg-green-500 rounded">未消化</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 text-center py-2 text-gray-700">
                                                        <input
                                                            type="checkbox"
                                                            checked={isConsumed}
                                                            onChange={() => handleConsumeRequest(req.id)}
                                                            disabled={isConsumed}
                                                            className="form-checkbox h-5 w-5 text-blue-600 transition duration-150 ease-in-out"
                                                        />
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}
