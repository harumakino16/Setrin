import { useEffect, useState, useContext } from 'react';
import { useRouter } from 'next/router';
import { db } from '../../../firebaseConfig';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
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

    async function createPlaylist(songs, setlistName) {
        setLoading(true); // ローディング開始
        const isValidUrl = (url) => {
            try {
                new URL(url);
                return true;
            } catch (_) {
                return false;
            }
        };

        const invalidUrls = songs.filter(song => !isValidUrl(song.youtubeUrl));
        if (invalidUrls.length > 0) {
            const invalidTitles = invalidUrls.map(song => `・ ${song.title}`).join('\n');
            setMessageInfo({ message: `エラー：無効なURLが含まれています。\n${invalidTitles}`, type: 'error' });
            setLoading(false); // ローディング終了
            return;
        }
        try {
            const refreshTokenResponse = await fetch('/api/refreshAccessToken', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ refreshToken: currentUser.youtubeRefreshToken }),
            });

            if (!refreshTokenResponse.ok) {
                setMessageInfo({ message: 'エラー：再生リストの作成中にエラーが発生しました', type: 'error' });
                throw new Error('Failed to refresh access token');
            }

            const { accessToken } = await refreshTokenResponse.json();

            const videoUrls = songs.map(song => song.youtubeUrl);
            const response = await fetch('/api/createPlaylist', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token: accessToken, videoUrls, setlistName }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                if (response.status === 403 && errorData.message.includes('YouTubeアカウントが停止または削除されています')) {
                    setMessageInfo({ message: 'YouTubeアカウントが停止または削除されています。設定ページでYouTube連携を解除し、有効なアカウントで再連携してください。', type: 'error' });
                } else {
                    setMessageInfo({ message: errorData.message, type: 'error' });
                }
                throw new Error(errorData.message);
            }

            const data = await response.json();
            
            setMessageInfo({ message: '再生リストを作成しました', type: 'success' });
        } catch (error) {
            setMessageInfo({ message: error.message, type: 'error' });
        } finally {
            setLoading(false); // ローディング終了
        }
    }

    const handleOpenEditModal = () => setIsEditOpen(true); // Added function to open edit modal
    const handleCloseEditModal = () => setIsEditOpen(false); // Added function to close edit modal

    return (
        <div className="flex">
            {/* <Sidebar /> */} {/* サイドバーを削除 */}
            <div className="flex-grow p-5 w-full">
                <Link href="/setlist" className="text-indigo-600 hover:text-indigo-900 mt-4">＜セットリスト履歴に戻る</Link>
                <h1 className="text-3xl font-bold mb-4 text-gray-800">セットリスト詳細</h1>
                {loading && (
                    <Loading /> // ローィング表示
                )}
                {setlist && (
                    <div className="bg-white p-6">
                        <p className="text-lg">
                            <strong>名前：</strong>{setlist.name}
                            <FaPen
                                onClick={handleOpenEditModal}
                                className="inline ml-2 text-gray-500 cursor-pointer text-sm"
                            />
                        </p>
                        <p className="text-lg"><strong>作成日:</strong> {setlist.createdAt.toDate().toLocaleDateString()}</p>
                        <p className="text-lg"><strong>曲数:</strong> {setlist.songIds ? setlist.songIds.length : 0}</p>
                        <div className="mt-4">
                            <h2 className="text-xl font-bold">曲リスト</h2>
                            {currentSongs.length === 0 ? (
                                <div className="text-center">
                                    <p>このセットリストに曲はありません。</p>
                                    <button
                                        onClick={() => router.push('/')}
                                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4 transition duration-300 ease-in-out"
                                    >
                                        曲を追加する
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    <button
                                        onClick={() => createPlaylist(currentSongs, setlist.name)}
                                        disabled={!currentUser.youtubeRefreshToken || currentSongs.length === 0}
                                        className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4 transition duration-300 ease-in-out ${!currentUser.youtubeRefreshToken || currentSongs.length === 0 ? ' bg-gray-300 cursor-not-allowed disabled' : ''}`}
                                    >
                                        YouTubeの再生リストに追加
                                    </button>
                                    {!currentUser.youtubeRefreshToken && (
                                        <Link href="/setting" className="text-blue-600 hover:text-blue-800 ml-4">
                                            Youtubeとリンクする(設定へ移動)
                                        </Link>
                                    )}
                                    <div className="mt-4">
                                        <DndProvider backend={HTML5Backend}>
                                            <SetlistTable currentSongs={currentSongs} setCurrentSongs={setCurrentSongs} setlist={setlist} setSetlist={setSetlist} currentUser={currentUser} router={router} />
                                        </DndProvider>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                {!setlist && (<div>
                    <p>再生リストはありません。</p>
                </div>)}
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
            </div>
        </div>
    );
};

export default SetlistDetail;



