import { useEffect, useState, useContext } from 'react';
import { useRouter } from 'next/router';
import { db } from '../../../firebaseConfig';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { AuthContext } from '@/context/AuthContext';
import Link from 'next/link';
import SongTable from '@/components/SongTable'; // SongTable コンポーネントをインポート
import { Sidebar } from '@/components/Sidebar'; // サイドバーをインポート

const SetlistDetail = () => {
    const [setlist, setSetlist] = useState(null);
    const [songs, setSongs] = useState([]);
    const [playlistName, setPlaylistName] = useState(''); // プレイリスト名のための状態
    const { currentUser } = useContext(AuthContext);
    const router = useRouter();
    const { id } = router.query;

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

    async function createPlaylist(songs, playlistName) {
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
                body: JSON.stringify({ token: accessToken, videoUrls, playlistName }),
            });

            if (!response.ok) {
                console.log('Failed to create playlist');
                console.log(response);
                alert('エラー：再生リストの作成に失敗しました');
                throw new Error('Failed to create playlist');
            }

            const data = await response.json();
            console.log('Playlist created:', data);
            alert('再生リストを作成しました');
        } catch (error) {
            console.error('Error creating playlist:', error);
        }


    }


    return (
        <div className="flex">
            <Sidebar /> {/* サイドバーを表示 */}
            <div className="flex-grow">
                <Link href="/setlisthistory" className="text-indigo-600 hover:text-indigo-900 mt-4">＜セットリスト履歴に戻る</Link>
                <h1 className="text-2xl font-bold mb-4">セットリスト詳細</h1>
                {setlist && (
                    <div>
                        <p>作成日: {setlist.createdAt.toDate().toLocaleDateString()}</p>
                        <p>曲数: {songs.length}</p>
                        <div className="mt-4">
                            <h2 className="text-xl font-bold">曲リスト</h2>
                            <SongTable songs={songs} pageName="setlisthistory/[id]" />
                            <input
                                type="text"
                                placeholder="プレイリスト名を入力"
                                value={playlistName}
                                onChange={(e) => setPlaylistName(e.target.value)}
                                className="border p-2 rounded w-full mb-4"
                            />
                            <button onClick={() => createPlaylist(songs, playlistName ? playlistName : "無名のプレイリスト")} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4">YouTubeの再生リストに追加</button>
                        </div>
                    </div>
                )}
                {/* <button onClick={() => getAccessToken()}>アクセストークンを取得</button>
                <div>アクセストークン：{accessToken}</div> */}
            </div>
        </div>
    );
};

export default SetlistDetail;
