import { useEffect, useState, useContext } from 'react';
import { useRouter } from 'next/router';
import { db } from '../../../firebaseConfig';
import { doc, getDoc, collection, getDocs, onSnapshot } from 'firebase/firestore';
import { AuthContext } from '@/context/AuthContext';
import Link from 'next/link';
import SetlistTable from '@/components/SetlistTable'; // SongTable コンポーネントをインポート
import { Sidebar } from '@/components/Sidebar'; // サイドバーをインポート
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useMessage } from '@/context/MessageContext';
import { useSongs } from '@/context/SongsContext';
import Loading from '@/components/loading'; // Loading コンポーネントをインポート


const SetlistDetail = () => {
    const [setlist, setSetlist] = useState(null); // スナップショットによるセットリスト
    const [currentSongs, setCurrentSongs] = useState([]);
    const { currentUser } = useContext(AuthContext);
    const router = useRouter();
    const { setMessageInfo } = useMessage();
    const { songs } = useSongs();
    const [loading, setLoading] = useState(false); // ローディング状態を追加
    const [firstLoad, setFirstLoad] = useState(true);

    useEffect(() => {
        const setlistRef = doc(db, `users/${currentUser.uid}/Setlists/${router.query.id}`);
        const unsubscribe = onSnapshot(setlistRef, (doc) => {
            if (doc.exists()) {
                setSetlist({ id: doc.id, ...doc.data() });
                console.log("セットリストが存在します");
            } else {
                setSetlist(null);
                console.log("セットリストが存在しないか、曲がありません。");
            }
        });


        return () => unsubscribe(); // Clean up subscription
    }, [currentUser, router.query.id]);


    useEffect(() => {
        const fetchCurrentSongs = async () => {
            if (setlist && setlist.songIds) {
                // 全てのソングをフィルタリングし、それからIDの順にソートする
                const songIdIndexMap = new Map(setlist.songIds.map((id, index) => [id, index]));
                const filteredSongs = songs
                    .filter(song => setlist.songIds.includes(song.id))
                    .sort((a, b) => songIdIndexMap.get(a.id) - songIdIndexMap.get(b.id));
                setCurrentSongs(filteredSongs);
                console.log("フェッチしました");
            } else {
                console.log("セットリストが存在しないか、曲がありません。");
                setCurrentSongs([]); // setlist が null の場合は空の配列を設定
            }
        };
        if (setlist && firstLoad) { // setlistが 存在する場合のみ fetchCurrentSongs を実行
            fetchCurrentSongs();
            setFirstLoad(false);
        }
        console.log(setlist);
    }, [setlist, songs, firstLoad]);
    

    async function createPlaylist(songs, setlistName) {
        setLoading(true); // ローディング開始
        try {
            const refreshTokenResponse = await fetch('/api/refreshAccessToken', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ refreshToken: currentUser.youtubeRefreshToken }),
            });
            console.log(refreshTokenResponse);
            console.log(currentUser.youtubeRefreshToken);

            if (!refreshTokenResponse.ok) {
                setMessageInfo({ message: 'エラー：再生リストの作成中にエラーが発生しました', type: 'error' });
                throw new Error('Failed to refresh access token');
            }

            const { accessToken } = await refreshTokenResponse.json();
            console.log(accessToken);

            const videoUrls = songs.map(song => song.youtubeUrl);
            const response = await fetch('/api/createPlaylist', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token: accessToken, videoUrls, setlistName }),
            });

            if (!response.ok) {
                console.log('Failed to create playlist');
                console.log(response);
                setMessageInfo({ message: 'エラー：再生リストの作成中にエラーが発生しました', type: 'error' });
                throw new Error('Failed to create playlist');
            }

            const data = await response.json();
            console.log('Playlist created:', data);
            setMessageInfo({ message: '再生リストを作成しました', type: 'success' });
        } catch (error) {
            console.error('Error creating playlist:', error);
            setMessageInfo({ message: 'エラー：再生リストの作成中にエラーが発生しました', type: 'error' });
        } finally {
            setLoading(false); // ローディング終了
        }
    }

    return (
        <div className="flex">
            <Sidebar /> {/* サイドバーを表示 */}
            <div className="flex-grow p-5">
                <Link href="/setlist" className="text-indigo-600 hover:text-indigo-900 mt-4">＜セットリスト履歴に戻る</Link>
                <h1 className="text-3xl font-bold mb-4 text-gray-800">セットリスト詳細</h1>
                {loading && (
                    <Loading /> // ローィング表示
                )}
                {setlist && (
                    <div className="bg-white p-6">
                        <p className="text-lg"><strong>名前：</strong>{setlist.name}</p>
                        <p className="text-lg"><strong>作成日:</strong> {setlist.createdAt.toDate().toLocaleDateString()}</p>
                        <p className="text-lg"><strong>曲数:</strong> {setlist.songIds ? setlist.songIds.length : 0}</p>
                        <div className="mt-4">
                            <h2 className="text-xl font-bold">曲リスト</h2>
                            <div className="mb-4">
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
                            </div>
                            <DndProvider backend={HTML5Backend}>
                                <SetlistTable currentSongs={currentSongs} setCurrentSongs={setCurrentSongs} setlist={setlist} setSetlist={setSetlist} currentUser={currentUser} router={router} />
                            </DndProvider>
                        </div>
                    </div>
                )}
                {!setlist && (<div>
                    <p>再生リストはありません。</p>
                </div>)}
            </div>
        </div>
    );
};

export default SetlistDetail;
