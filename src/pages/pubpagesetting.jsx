// pages/pubpagesetting.jsx
import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';
import { useRouter } from 'next/router';
import { db } from '../../firebaseConfig';
import { collection, getDocs, doc, setDoc, deleteDoc, updateDoc, increment, serverTimestamp, writeBatch } from 'firebase/firestore';
import Layout from '@/pages/layout';
import Link from 'next/link';
import SongListNameModal from '@/components/SongListNameModal';
import { FaTrash, FaPlus, FaSearch, FaClock } from 'react-icons/fa';
import { useMessage } from '@/context/MessageContext';
import { useTheme } from '@/context/ThemeContext';
import Price from '@/components/Price';
import Modal from '@/components/Modal';
import { getCountFromServer } from 'firebase/firestore';
import { FREE_PLAN_MAX_PUBLIC_PAGES, PREMIUM_PLAN_MAX_PUBLIC_PAGES } from '@/constants';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';


export default function PubPageSetting() {
    const { currentUser } = useContext(AuthContext);
    const [songLists, setSongLists] = useState([]);
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const { setMessageInfo } = useMessage();
    const { theme } = useTheme();
    const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);

    useEffect(() => {
        if (!currentUser) return;
        const fetchSongLists = async () => {
            const listsRef = collection(db, 'users', currentUser.uid, 'publicPages');
            const listsSnapshot = await getDocs(listsRef);
            const listsData = listsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            // 作成日の降順でソート
            listsData.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);
            setSongLists(listsData);
        };
        fetchSongLists();
    }, [currentUser]);

    const handleAddSongList = async () => {
        if (!currentUser) return;

        const listsRef = collection(db, 'users', currentUser.uid, 'publicPages');
        const listsSnapshot = await getCountFromServer(listsRef);
        const listCount = listsSnapshot.data().count;

        if (currentUser.plan === 'free' && listCount >= FREE_PLAN_MAX_PUBLIC_PAGES) {
            setMessageInfo({
                type: 'error',
                message: `フリープランでは公開リストは${FREE_PLAN_MAX_PUBLIC_PAGES}個までです。`
            });
            setIsPriceModalOpen(true);
            return;
        }

        if (currentUser.plan === 'premium' && listCount >= PREMIUM_PLAN_MAX_PUBLIC_PAGES) {
            setMessageInfo({
                type: 'error',
                message: `公開リストは${PREMIUM_PLAN_MAX_PUBLIC_PAGES}個が上限です。`
            });
            return;
        }

        setIsModalOpen(true);
    };

    const handleSaveListName = async (name) => {
        setIsModalOpen(false);
        if (!currentUser) return;

        const newId = crypto.randomUUID();
        const userPublicPageRef = doc(db, 'users', currentUser.uid, 'publicPages', newId);
        const now = new Date();
        const pageData = {
            name: name,
            createdAt: now,
            description: '',
            showDescription: true,
            color: theme || 'blue'
        };

        const topLevelPublicPageRef = doc(db, 'publicPages', newId);
        const topLevelData = {
            userId: currentUser.uid,
            name: name,
            createdAt: now,
            color: theme || 'blue'
        };

        try {
            await Promise.all([
                setDoc(userPublicPageRef, pageData),
                setDoc(topLevelPublicPageRef, topLevelData)
            ]);
            const userRef = doc(db, 'users', currentUser.uid);
            // ユーザーの公開リスト数を +1
            await updateDoc(userRef, {
                'userActivity.publicPageCount': increment(1),
                'userActivity.lastActivityAt': serverTimestamp(),
              });
            router.push(`/pubpagesetting/${newId}`);
        } catch (error) {
            console.error("Error adding document: ", error);
        }
    };

    const handleDeleteList = async (listId) => {
        if (!currentUser) return;
        const confirmDelete = window.confirm('この公開リストを削除しますか？この操作は取り消せません。');
        if (!confirmDelete) return;

        try {
            // users/{userId}/publicPages/{listId} 削除
            const userPublicPageRef = doc(db, 'users', currentUser.uid, 'publicPages', listId);
            await deleteDoc(userPublicPageRef);

            // publicPages/{listId} 削除
            const topLevelPublicPageRef = doc(db, 'publicPages', listId);
            await deleteDoc(topLevelPublicPageRef);

            // ローカル状態からも削除
            setSongLists(prev => prev.filter(list => list.id !== listId));
            
            setMessageInfo({
                type: 'success',
                message: '公開リストを削除しました。'
            });
            const userRef = doc(db, 'users', currentUser.uid);
            // ユーザーの公開リスト数を -1 
            await updateDoc(userRef, {
                'userActivity.publicPageCount': increment(-1),
                'userActivity.lastActivityAt': serverTimestamp(),
              });
        } catch (error) {
            console.error("Error deleting document: ", error);
        }
    };

    const filteredLists = songLists.filter(list =>
        list.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (!list.name && '名称未設定...'.includes(searchQuery.toLowerCase()))
    );

    return (
        <Layout>
            <div className="p-8 space-y-6 max-w-4xl mx-auto">
                <div className="space-y-2">
                    <h1 className="text-2xl font-bold">公開リスト管理</h1>
                    <p className="text-gray-700 text-sm">
                        あなたの持ち歌を歌える曲リストとして一般公開できます。<br/>
                        公開する曲の条件を指定でき、リスナーに共有可能な公開ページURLが発行されます。
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                    <button
                        onClick={handleAddSongList}
                        className={`bg-customTheme-${theme}-primary hover:bg-customTheme-${theme}-primary-dark text-white px-4 py-2 rounded shadow inline-flex items-center space-x-2`}
                    >
                        <FaPlus />
                        <span>新しい公開リストを作成</span>
                    </button>

                    {songLists.length > 0 && (
                        <div className="flex items-center space-x-2">
                            <div className="relative text-gray-600 focus-within:text-gray-800">
                                <input
                                    type="text"
                                    placeholder="リストを検索..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="border border-gray-300 rounded pl-10 pr-3 py-2 w-full sm:w-64 focus:outline-none focus:border-blue-400"
                                />
                                <FaSearch className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-4 space-y-4">
                    {filteredLists.length === 0 && songLists.length === 0 && (
                        <div className="text-gray-600 text-sm p-4 bg-gray-50 border border-gray-200 rounded">
                            まだ公開リストがありません。「新しい公開リストを作成」ボタンを押して、
                            あなたの歌える曲リストを公開用に作成してみましょう。
                        </div>
                    )}

                    {filteredLists.length === 0 && songLists.length > 0 && (
                        <div className="text-gray-600 text-sm p-4 bg-gray-50 border border-gray-200 rounded">
                            該当するリストがありません。検索条件を変更してください。
                        </div>
                    )}

                    {filteredLists.map((list) => {
                        const createdAt = list.createdAt?.toDate();
                        const formattedDate = createdAt 
                            ? createdAt.toLocaleDateString('ja-JP', {
                                year: 'numeric', month: 'numeric', day: 'numeric',
                                hour: '2-digit', minute: '2-digit'
                            })
                            : '不明な日時';

                        return (
                            <Link href={`/pubpagesetting/${list.id}`} legacyBehavior key={list.id}>
                                <div 
                                    className="bg-white p-4 border border-gray-200 rounded shadow-sm hover:shadow-lg transition-shadow cursor-pointer"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-semibold text-gray-700 text-lg">
                                            {list.name || '名称未設定...'}
                                        </span>
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation(); // リンクのクリックを防ぐ
                                                handleDeleteList(list.id);
                                            }}
                                            className="text-red-500 hover:text-red-700 transition-colors"
                                            title="このリストを削除"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-500 mt-2 space-x-2">
                                        <FaClock />
                                        <span>作成日: {formattedDate}</span>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
            {isModalOpen && (
                <SongListNameModal
                    onSave={handleSaveListName}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
            {isPriceModalOpen && (
                <Modal isOpen={isPriceModalOpen} onClose={() => setIsPriceModalOpen(false)}>
                    <Price />
                </Modal>
            )}
        </Layout>
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