// pages/request-utawaku.jsx

import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';
import Layout from '@/pages/layout';
import { db } from '@/../firebaseConfig';
import { collection, doc, getDocs, getDoc, setDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { useTheme } from '@/context/ThemeContext';
import { useMessage } from '@/context/MessageContext';
import StartRequestModeCTA from '@/components/StartRequestModeCTA'; // 先ほど作成したコンポーネント
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy } from '@fortawesome/free-solid-svg-icons';

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

        // ページ情報取得
        const pageRef = doc(db, 'users', currentUser.uid, 'publicPages', selectedPageId);
        getDoc(pageRef).then((pageDoc) => {
            if (pageDoc.exists()) {
                const data = pageDoc.data();
                setRequestMode(data.requestMode || false);
                setPageName(data.name || '名称未設定...');
                if (typeof window !== 'undefined') {
                  setPublicURL(`${window.location.origin}/public/${selectedPageId}`);
                }
            }
        });

        // リクエスト一覧をリアルタイムで取得
        const requestsRef = collection(db, 'publicPages', selectedPageId, 'requests');
        const unsubscribe = onSnapshot(requestsRef, (snapshot) => {
            const reqData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            reqData.sort((a, b) => b.requestedAt?.toDate() - a.requestedAt?.toDate());
            setRequests(reqData);
        });

        return () => unsubscribe();
    }, [currentUser, selectedPageId]);

    const handleToggleRequestMode = async () => {
        if (!currentUser || !selectedPageId) return;
        const pageRef = doc(db, 'users', currentUser.uid, 'publicPages', selectedPageId);
        await updateDoc(pageRef, {
            requestMode: !requestMode
        });
        setRequestMode(!requestMode);
        setMessageInfo({ type: 'success', message: `リクエスト受付を${!requestMode ? '開始' : '停止'}しました。` });
    };

    const handleConsumeRequest = async (requestId) => {
        if (!selectedPageId || !requestId) return;
        const requestRef = doc(db, 'publicPages', selectedPageId, 'requests', requestId);
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
            <div className="p-8 space-y-6 max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold">リクエスト歌枠管理</h1>
                <p className="text-sm text-gray-700">
                    このページでは、リクエスト歌枠で受け付けたリクエスト一覧を管理し、受付のオン・オフを切り替えることができます。
                </p>

                {/* 公開ページ選択 */}
                <div className="space-y-2">
                    <label className="block text-gray-700 font-semibold">公開ページを選択</label>
                    <div className="flex gap-2">
                        <select
                            value={selectedPageId}
                            onChange={(e) => {
                                setSelectedPageId(e.target.value);
                                if (typeof window !== 'undefined') {
                                  setPublicURL(`${window.location.origin}/public/${e.target.value}`);
                                }
                            }}
                            className="border border-gray-300 rounded px-3 py-2"
                        >
                            {publicPages.length === 0 && <option>公開ページがありません</option>}
                            {publicPages.map((page) => (
                                <option key={page.id} value={page.id}>
                                    {page.name || '名称未設定...'}
                                </option>
                            ))}
                        </select>
                        <div className="flex w-full items-center gap-2">
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
                    </div>
                </div>

                {selectedPageId && (
                    <div className="space-y-4">
                        <div className="bg-white p-4 rounded shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold">
                                    {pageName || '名称未設定...'}
                                </h2>
                                <div className="flex items-center space-x-3">
                                    <span className="text-sm font-semibold">
                                        {requestMode ? 'リクエスト受付中です' : 'リクエスト受付は停止中'}
                                    </span>
                                    {/* 大きめのトグル */}
                                    <button
                                        onClick={handleToggleRequestMode}
                                        className={`relative inline-flex items-center cursor-pointer 
                                        ${requestMode ? 'bg-green-500' : 'bg-gray-300'} 
                                        w-16 h-8 rounded-full transition-colors duration-300 focus:outline-none`}
                                    >
                                        <span
                                            className={`inline-block w-6 h-6 bg-white rounded-full transform transition-transform duration-300 
                                            ${requestMode ? 'translate-x-8' : 'translate-x-1'}`}
                                        />
                                    </button>
                                </div>
                            </div>
                            <p className="text-sm text-gray-600">
                                選択中の公開ページのリクエスト状況を管理します。  
                                リクエスト受付中にするとリスナーは公開ページからリクエストを送信できます。
                            </p>
                        </div>

                        {/* リクエスト一覧 */}
                        <div className="bg-white p-4 rounded shadow-sm">
                            <h3 className="text-lg font-semibold mb-4">リクエスト一覧</h3>
                            {requests.length === 0 && (
                                <p className="text-gray-600 text-sm">まだリクエストがありません。</p>
                            )}
                            {requests.length > 0 && (
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead>
                                        <tr className="bg-gray-50">
                                            <th className="px-4 py-2 text-left text-xs font-bold text-gray-500 uppercase">曲名</th>
                                            <th className="px-4 py-2 text-left text-xs font-bold text-gray-500 uppercase">リクエスター名</th>
                                            <th className="px-4 py-2 text-left text-xs font-bold text-gray-500 uppercase">時刻</th>
                                            <th className="px-4 py-2 text-left text-xs font-bold text-gray-500 uppercase">ステータス</th>
                                            <th className="px-4 py-2 text-left text-xs font-bold text-gray-500 uppercase">消化する</th>
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
                                            return (
                                                <tr key={req.id}>
                                                    <td className="px-4 py-2 text-sm text-gray-700">{req.songTitle}</td>
                                                    <td className="px-4 py-2 text-sm text-gray-700">{req.requesterName || '匿名'}</td>
                                                    <td className="px-4 py-2 text-sm text-gray-700">{timeStr}</td>
                                                    <td className="px-4 py-2 text-sm text-gray-700">
                                                        {req.consumed ? (
                                                            <span className="inline-block px-2 py-1 text-xs text-white bg-gray-500 rounded">消化済み</span>
                                                        ) : (
                                                            <span className="inline-block px-2 py-1 text-xs text-white bg-green-500 rounded">未消化</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-2 text-sm text-gray-700">
                                                        <input
                                                            type="checkbox"
                                                            checked={req.consumed || false}
                                                            disabled={req.consumed}
                                                            onChange={(e) => {
                                                                if (e.target.checked) {
                                                                    handleConsumeRequest(req.id);
                                                                }
                                                            }}
                                                            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
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
