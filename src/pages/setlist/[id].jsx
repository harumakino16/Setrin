import { useEffect, useState, useContext } from 'react';
import { useRouter } from 'next/router';
import { db } from '../../../firebaseConfig';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { AuthContext } from '@/context/AuthContext';
import Link from 'next/link';
import SongTable from '@/components/SongTable'; // SongTable コンポーネントをインポート
import { Sidebar } from '@/components/Sidebar'; // サイドバーをインポート
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import MessageBox from '@/components/MessageBox'; // MessageBox コンポーネントをインポート

const SetlistDetail = () => {
    const [setlist, setSetlist] = useState(null);
    const [songs, setSongs] = useState([]);
    const { currentUser } = useContext(AuthContext);
    const router = useRouter();
    const { id } = router.query;
    const [messageInfo, setMessageInfo] = useState({ message: '', type: '' }); // MessageBox用のメッセージ状態をオブジェクトで管理

    useEffect(() => {
        const fetchSetlistDetail = async () => {
            if (currentUser && id) {
                const setlistDocRef = doc(db, 'users', currentUser.uid, 'Setlists', id);
                const setlistDoc = await getDoc(setlistDocRef);
                if (setlistDoc.exists()) {
                    setSetlist({ id: setlistDoc.id, ...setlistDoc.data() });
                    const songsRef = collection(db, 'users', currentUser.uid, 'Setlists', id, 'Songs');
                    const songsSnapshot = await getDocs(songsRef);
                    const songsData = songsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setSongs(songsData);
                } else {
                    console.log('セットリストが見つかりません');
                }
            }
        };
        
        fetchSetlistDetail();
    }, [currentUser, id]);

    async function createPlaylist(songs, setlistName) {
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
                setMessageInfo({ message: 'エラー：再生リストの作成に失敗しました', type: 'error' });
                throw new Error('Failed to create playlist');
            }

            const data = await response.json();
            console.log('Playlist created:', data);
            setMessageInfo({ message: '再生リストを作成しました', type: 'success' });
        } catch (error) {
            console.error('Error creating playlist:', error);
            setMessageInfo({ message: 'エラー：再生リストの作成中にエラーが発生しました', type: 'error' });
        }
    }

    return (
        <div className="flex">
            <Sidebar /> {/* サイドバーを表示 */}
            <div className="flex-grow p-5">
                <Link href="/setlist" className="text-indigo-600 hover:text-indigo-900 mt-4">＜セットリスト履歴に戻る</Link>
                <h1 className="text-3xl font-bold mb-4 text-gray-800">セットリスト詳細</h1>
                {setlist ? (
                    <div className="bg-white p-6">
                        <p className="text-lg"><strong>名前：</strong>{setlist.name}</p>
                        <p className="text-lg"><strong>作成日:</strong> {setlist.createdAt.toDate().toLocaleDateString()}</p>
                        <p className="text-lg"><strong>曲数:</strong> {songs.length}</p>
                        <div className="mt-4">
                            <h2 className="text-xl font-bold">曲リスト</h2>
                            <DndProvider backend={HTML5Backend}>
                                <SongTable songs={songs} setSongs={setSongs}  // ここで setSongs 関数を渡す
                                    pageName="setlist/[id]" />
                            </DndProvider>
                            <button
                                onClick={() => createPlaylist(songs, setlist.name)}
                                disabled={currentUser.refreshToken}
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4 transition duration-300 ease-in-out"
                            >
                                YouTubeの再生リストに追加
                            </button>
                        </div>
                    </div>
                ) : (<div>
                    <p>再生リストはありません。</p>
                </div>)}
            </div>
            <MessageBox message={messageInfo.message} type={messageInfo.type} /> {/* MessageBox を表示 */}
        </div>
    );
};

export default SetlistDetail;
