import { useEffect, useState, useContext } from 'react';
import { useRouter } from 'next/router';
import { db } from '../../../firebaseConfig';
import { doc, onSnapshot, updateDoc, increment, getDoc } from 'firebase/firestore';
import { AuthContext } from '@/context/AuthContext';
import Link from 'next/link';
import SetlistTable from '@/components/SetlistTable'; // SongTable コンポーネントをインポート
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useMessage } from '@/context/MessageContext';
import { useSongs } from '@/context/SongsContext';
import Loading from '@/components/loading'; // Loading コンポーネントをインポート
import EditSetlistNameModal from '@/components/EditSetlistNameModal'; // Added import for EditSetlistNameModal
import { FaPen } from 'react-icons/fa'; // ペンアイコンをインポート
import ColumnSettingsModal from '@/components/ColumnSettingsModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faYoutube } from '@fortawesome/free-brands-svg-icons';
import Layout from '@/pages/layout';
import { FREE_PLAN_MAX_YOUTUBE_PLAYLISTS } from '@/constants';
import { useTheme } from '@/context/ThemeContext';
import { createPlaylist } from '@/utils/createPlaylist'; // createPlaylist関数をインポート
import H1 from '@/components/ui/h1';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import BackButton from '@/components/BackButton';

const SetlistDetail = () => {
    const [setlist, setSetlist] = useState(null); // スナップショットによるセットリスト
    const [currentSongs, setCurrentSongs] = useState([]);
    const { currentUser } = useContext(AuthContext);
    const router = useRouter();
    const { setMessageInfo } = useMessage();
    const { songs } = useSongs();
    const [loading, setLoading] = useState(false); // ローディング状態を追加
    const [firstLoad, setFirstLoad] = useState(true);
    const [isEditOpen, setIsEditOpen] = useState(false); // Added state for edit modal
    const [isColumnSettingsOpen, setIsColumnSettingsOpen] = useState(false);
    const [showArtist, setShowArtist] = useState(false);
    const { theme } = useTheme();
    const { t } = useTranslation('common');


    // visibleColumns の初期値をローカルストレージから取得
    const getInitialVisibleColumns = () => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(`visibleColumns_setlist_${router.query.id}`);
            if (saved) {
                try {
                    return JSON.parse(saved);
                } catch (error) {
                    console.error('Error parsing visibleColumns from localStorage:', error);
                }
            }
        }
        return {
            order: { label: '順番', visible: true, removable: false },
            title: { label: '曲名', visible: true, removable: true },
            artist: { label: 'アーティスト', visible: true, removable: true },
            genre: { label: 'ジャンル', visible: true, removable: true },
            tags: { label: 'タグ', visible: true, removable: true },
            singingCount: { label: '歌唱回数', visible: true, removable: true },
            skillLevel: { label: '熟練度', visible: true, removable: true },
            note: { label: '備考', visible: true, removable: true },
            memo: { label: 'メモ', visible: true, removable: true },
            delete: { label: '削除', visible: true, removable: true }
        };
    };

    const [visibleColumns, setVisibleColumns] = useState(getInitialVisibleColumns);

    // visibleColumns をローカルストレージに保存
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(`visibleColumns_setlist_${router.query.id}`, JSON.stringify(visibleColumns));
        }
    }, [visibleColumns, router.query.id]);

    useEffect(() => {
        const setlistRef = doc(db, `users/${currentUser.uid}/Setlists/${router.query.id}`);
        const unsubscribe = onSnapshot(setlistRef, (doc) => {
            if (doc.exists()) {
                setSetlist({ id: doc.id, ...doc.data() });
            } else {
                setSetlist(null);
            }
        });

        return () => unsubscribe(); // Clean up subscription
    }, [currentUser, router.query.id]);

    useEffect(() => {
        const fetchCurrentSongs = async () => {
            if (setlist && setlist.songIds) {
                const songIdIndexMap = new Map(setlist.songIds.map((id, index) => [id, index]));
                const filteredSongs = songs
                    .filter(song => setlist.songIds.includes(song.id))
                    .sort((a, b) => songIdIndexMap.get(a.id) - songIdIndexMap.get(b.id));
                setCurrentSongs(filteredSongs);
            } else {
                setCurrentSongs([]);
            }
        };
        if (setlist) {
            fetchCurrentSongs();
        }
    }, [setlist, songs, router.query.id]); // Add router.query.id to dependencies

    const toggleColumnVisibility = (columnKey) => {
        if (visibleColumns[columnKey].removable) {
            setVisibleColumns(prev => ({
                ...prev,
                [columnKey]: { ...prev[columnKey], visible: !prev[columnKey].visible }
            }));
        }
    };

    const handleOpenEditModal = () => setIsEditOpen(true); // Added function to open edit modal
    const handleCloseEditModal = () => setIsEditOpen(false); // Added function to close edit modal

    const handleCloseColumnSettings = () => setIsColumnSettingsOpen(false);

    return (
        <Layout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="py-8">
                    <BackButton text="セットリスト履歴に戻る" href="/setlist" />
                    <H1>セットリスト詳細</H1>
                    {loading && <Loading />}

                    {setlist && (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mt-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center space-x-4">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {setlist.name}
                                    </h2>
                                    <button
                                        onClick={handleOpenEditModal}
                                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors duration-200"
                                    >
                                        <FaPen className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="flex items-center space-x-2 text-sm text-gray-500">
                                    <span>作成日: {setlist.createdAt.toDate().toLocaleDateString()}</span>
                                    <span>•</span>
                                    <span>曲数: {setlist.songIds ? setlist.songIds.length : 0}</span>
                                </div>
                            </div>

                            {currentSongs.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="mx-auto w-24 h-24 mb-4">
                                        <svg className="w-full h-full text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                                        このセットリストに曲はありません
                                    </h3>
                                    <div className={`bg-customTheme-${theme}-secondary/10 rounded-lg p-6 mb-6 max-w-2xl mx-auto`}>
                                        <h4 className="font-bold mb-4">曲の追加方法:</h4>
                                        <ol className="space-y-3 text-left list-decimal list-inside">
                                            <li>トップページの<Link href="/" className="text-indigo-600 hover:text-indigo-900 underline">曲リスト</Link>から追加したい曲を選択</li>
                                            <li>「セットリストに追加」ボタンをクリック</li>
                                            <li>このセットリストを選択</li>
                                        </ol>
                                    </div>
                                    <button
                                        onClick={() => router.push('/')}
                                        className={`inline-flex items-center px-6 py-3 bg-customTheme-${theme}-primary text-white rounded-lg hover:opacity-80 transition duration-200`}
                                    >
                                        曲リストへ移動
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center">
                                        <button
                                            onClick={() => createPlaylist(currentSongs, setlist.name, currentUser, setMessageInfo, setLoading, router)}
                                            disabled={!currentUser.youtubeRefreshToken || currentSongs.length === 0}
                                            className={`inline-flex items-center px-4 py-2 rounded-md shadow-sm text-sm font-medium transition-colors duration-200
                                                ${!currentUser.youtubeRefreshToken || currentSongs.length === 0
                                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                    : 'bg-red-600 text-white hover:bg-red-700'}`}
                                        >
                                            <FontAwesomeIcon icon={faYoutube} className="mr-2" />
                                            YouTubeに再生リストを作成
                                        </button>
                                        <button
                                            onClick={() => setIsColumnSettingsOpen(true)}
                                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                                        >
                                            <FaPen className="mr-2 w-4 h-4" />
                                            列の表示設定
                                        </button>
                                    </div>

                                    {!currentUser.youtubeRefreshToken && (
                                        <div className="rounded-md bg-yellow-50 p-4">
                                            <div className="flex">
                                                <div className="flex-shrink-0">
                                                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                                <div className="ml-3">
                                                    <Link
                                                        href="/setting"
                                                        className="text-sm font-medium text-yellow-800 hover:text-yellow-900"
                                                    >
                                                        YouTubeとリンクする（設定へ移動）
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="mt-4">
                                        <DndProvider backend={HTML5Backend}>
                                            <SetlistTable currentSongs={currentSongs} setCurrentSongs={setCurrentSongs} currentUser={currentUser} setlist={setlist} visibleColumns={visibleColumns} setVisibleColumns={toggleColumnVisibility} />
                                        </DndProvider>
                                    </div>

                                    {currentSongs.length > 0 && (
                                        <div className="mt-4">
                                            <div className="flex justify-between mb-2">
                                                <p className="text-lg font-bold">曲名一覧(コピー用)</p>
                                                <div className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        id="showArtist"
                                                        className="mr-2"
                                                        onChange={(e) => setShowArtist(e.target.checked)}
                                                    />
                                                    <label htmlFor="showArtist" className="text-sm text-gray-500">アーティスト名も表示</label>
                                                </div>
                                            </div>
                                            <textarea
                                                readOnly
                                                className="w-full p-2 border rounded"
                                                rows={currentSongs.length}
                                                value={currentSongs.map(song => showArtist ? `${song.title} / ${song.artist}` : song.title).join('\n')}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {!setlist && (
                        <div className="text-center py-12">
                            <p className="text-gray-500">セットリストが見つかりませんでした。</p>
                        </div>
                    )}

                    {isEditOpen && (
                        <EditSetlistNameModal
                            setlist={setlist}
                            isOpen={isEditOpen}
                            onClose={handleCloseEditModal}
                            currentUser={currentUser}
                            onSetlistUpdated={(updatedSetlist) => {
                                const setlistRef = doc(db, `users/${currentUser.uid}/Setlists/${router.query.id}`);
                                updateDoc(setlistRef, { name: updatedSetlist.name });
                                setSetlist(updatedSetlist);
                            }}
                        />
                    )}
                    {isColumnSettingsOpen && (
                        <ColumnSettingsModal
                            isOpen={isColumnSettingsOpen}
                            onClose={handleCloseColumnSettings}
                            visibleColumns={visibleColumns}
                            toggleColumnVisibility={toggleColumnVisibility}
                        />
                    )}
                </div>
            </div>
        </Layout>
    );
};

// 静的パスを生成するための新しいメソッド
export async function getStaticPaths({ locales }) {
    return {
        paths: [], // 空の配列で、すべてのパスを動的に生成
        fallback: 'blocking' // サーバーサイドでページを生成
    };
}

export async function getStaticProps({ params, locale }) {
    return {
        props: {
            ...(await serverSideTranslations(locale, ['common'])),
        },
        revalidate: 60 // 必要に応じて、ページを再生成する間隔（秒）
    };
}

export default SetlistDetail;





