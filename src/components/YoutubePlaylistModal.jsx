import { useState, useContext, useEffect } from 'react';
import { db } from '../../firebaseConfig';
import { writeBatch, doc, collection, getCountFromServer, query } from 'firebase/firestore';
import { useMessage } from '@/context/MessageContext';
import { AuthContext } from '@/context/AuthContext';
import { formatSongData } from '../utils/songUtils';
import Link from 'next/link';
import LoadingIcon from './ui/loadingIcon';
import { useTheme } from '@/context/ThemeContext';
import { FREE_PLAN_MAX_SONGS } from '@/constants';


const YoutubePlaylistModal = ({ onClose }) => {
    const { currentUser } = useContext(AuthContext);
    const { setMessageInfo } = useMessage();
    const [playlistUrl, setPlaylistUrl] = useState('');
    const [importedSongs, setImportedSongs] = useState([]);
    const [editingSong, setEditingSong] = useState(null);
    const [editedTitle, setEditedTitle] = useState('');
    const [editedArtist, setEditedArtist] = useState('');
    const [editedSingingCount, setEditedSingingCount] = useState(0);
    const [editedskillLevel, setEditedskillLevel] = useState(0);
    const [editedTags, setEditedTags] = useState("");
    const [editedGenre, setEditedGenre] = useState('');
    const [loading, setLoading] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const { theme } = useTheme();
    const [totalSongCount, setTotalSongCount] = useState(0);

    useEffect(() => {
        const fetchTotalSongCount = async () => {
            try {
                const userSongsRef = collection(db, 'users', currentUser.uid, 'Songs');
                const snapshot = await getCountFromServer(query(userSongsRef));
                setTotalSongCount(snapshot.data().count);
            } catch (error) {
                console.error('総曲数の取得に失敗しました:', error);
            }
        };

        fetchTotalSongCount();
        
    }, [currentUser.uid]);

    const SONG_LIMIT = currentUser.plan === 'free' ? FREE_PLAN_MAX_SONGS : Infinity;

    const isOverLimit = (totalSongCount + importedSongs.length) > SONG_LIMIT;

    const handleImport = async () => {
        try {
            setLoading(true);
            setIsImporting(true);
            const response = await fetch('/api/importPlaylist', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ playlistUrl, currentUser }),
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.error === 'invalid_grant') {
                    setMessageInfo({ 
                        message: 'YouTube連携の再認証が必要です。設定画面から一度連携を解除してから再度連携を行ってください。', 
                        type: 'error' 
                    });
                    onClose(); // モーダルを閉じる
                    return;
                }
                throw new Error(data.message || '再生リストのインポートに失敗しました');
            }

            setImportedSongs(data.items);
            setMessageInfo({ message: '再生リストがインポートされました', type: 'success' });
        } catch (error) {
            setMessageInfo({ 
                message: error.message || '再生リストのインポートに失敗しました', 
                type: 'error' 
            });
        } finally {
            setLoading(false);
            setIsImporting(false);
        }
    };
    

    const handleDeleteSong = (songId) => {
        setImportedSongs(importedSongs.filter(song => song.youtubeUrl !== songId));
    };

    const handleAddToSongs = async () => {
        try {
            const batch = writeBatch(db);
            
            importedSongs.forEach(song => {
                const songData = formatSongData(song, true); // trueを渡してisNewSongフラグを設定
                
                const songRef = doc(db, 'users', currentUser.uid, 'Songs', encodeURIComponent(song.youtubeUrl).replace(/\./g, '%2E'));
                batch.set(songRef, songData);
            });
            await batch.commit();
            setMessageInfo({ message: '曲が追加されました', type: 'success' });
            onClose();
        } catch (error) {
            setMessageInfo({ message: error.message, type: 'error' });
        }
    };

    const handleEditSong = (song) => {
        setEditingSong(song);
        setEditedTitle(song.title);
        setEditedArtist(song.artist);
        setEditedSingingCount(song.singingCount || '');
        setEditedskillLevel(song.skillLevel || '');
        setEditedTags(song.tags || '');
        setEditedGenre(song.genre || '');
    };

    const handleSaveEdit = () => {
        setImportedSongs(importedSongs.map(song =>
            song.youtubeUrl === editingSong.youtubeUrl ? { ...song, title: editedTitle, artist: editedArtist, singingCount: editedSingingCount, skillLevel: editedskillLevel, tags: editedTags.split(',').slice(0, 3).join(','), genre: editedGenre } : song
        ));
        setEditingSong(null);
    };

    return (
        <div>
            <h2 className="text-xl font-bold mb-4">Youtube再生リストから追加</h2>
            {currentUser && !currentUser.youtubeRefreshToken ? (
                <p className="text-blue-500 mb-4 text-center">
                    <Link href="/setting" className="underline">Youtubeと連携する(設定ページへ)</Link>
                </p>
            ) : (
                <>
                    <input
                        type="text"
                        value={playlistUrl}
                        onChange={(e) => setPlaylistUrl(e.target.value)}
                        placeholder="再生リストのURLを入力"
                        className="border p-2 rounded w-full mb-4"
                        disabled={isImporting}
                    />
                    <button 
                        onClick={handleImport} 
                        className={`bg-customTheme-${theme}-primary hover:bg-customTheme-${theme}-accent text-white font-bold py-2 px-4 rounded w-full ${isImporting || !playlistUrl ? 'bg-gray-300 hover:bg-gray-300 cursor-not-allowed' : ''}`}
                        disabled={isImporting || !playlistUrl}
                    >
                        {isImporting ? <LoadingIcon /> : 'インポート'}
                    </button>
                    {isImporting && (
                        <div className="mt-4 text-center">
                            <p>再生リストをインポート中です。しばらくお待ちください...</p>
                        </div>
                    )}
                </>
            )}
            {importedSongs.length > 0 && (
                <div>
                    <h3 className="text-xl text-center font-bold my-8">以下の曲を追加します</h3>
                    <div className="overflow-y-auto max-h-96">
                        <table className="min-w-full divide-y divide-gray-200 mt-2 bg-gray-100">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ maxWidth: '400px' }}>曲名</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ maxWidth: '300px' }}>アーティスト</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ジャンル</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">タグ(カンマ区切りで複数入力)</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">歌唱回数</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">熟練度</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {importedSongs.map((song) => (
                                    <tr key={song.youtubeUrl} className="bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap" style={{ maxWidth: '400px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {editingSong && editingSong.youtubeUrl === song.youtubeUrl ? (
                                                <input
                                                    type="text"
                                                    value={editedTitle}
                                                    onChange={(e) => setEditedTitle(e.target.value)}
                                                    className="border p-2 rounded w-full"
                                                />
                                            ) : (
                                                song.title
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap" style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {editingSong && editingSong.youtubeUrl === song.youtubeUrl ? (
                                                <input
                                                    type="text"
                                                    value={editedArtist}
                                                    onChange={(e) => setEditedArtist(e.target.value)}
                                                    className="border p-2 rounded w-full"
                                                />
                                            ) : (
                                                song.artist
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {editingSong && editingSong.youtubeUrl === song.youtubeUrl ? (
                                                <input
                                                    type="text"
                                                    value={editedGenre}
                                                    onChange={(e) => setEditedGenre(e.target.value)}
                                                    className="border p-2 rounded w-full"
                                                />
                                            ) : (
                                                song.genre
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {editingSong && editingSong.youtubeUrl === song.youtubeUrl ? (
                                                <input
                                                    type="text"
                                                    value={editedTags}
                                                    onChange={(e) => setEditedTags(e.target.value)}
                                                    className="border p-2 rounded w-full"
                                                />
                                            ) : (
                                                song.tags
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {editingSong && editingSong.youtubeUrl === song.youtubeUrl ? (
                                                <input
                                                    type="text"
                                                    value={editedSingingCount}
                                                    onChange={(e) => setEditedSingingCount(e.target.value)}
                                                    className="border p-2 rounded w-full"
                                                />
                                            ) : (
                                                song.singingCount
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {editingSong && editingSong.youtubeUrl === song.youtubeUrl ? (
                                                <input
                                                    type="text"
                                                    value={editedskillLevel}
                                                    onChange={(e) => setEditedskillLevel(e.target.value)}
                                                    className="border p-2 rounded w-full"
                                                />
                                            ) : (
                                                song.skillLevel
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {editingSong && editingSong.youtubeUrl === song.youtubeUrl ? (
                                                <button onClick={handleSaveEdit} className="text-green-500 hover:text-green-700">保存</button>
                                            ) : (
                                                <>
                                                    <button onClick={() => handleEditSong(song)} className="text-blue-500 hover:text-blue-700">編集</button>
                                                    <button onClick={() => handleDeleteSong(song.youtubeUrl)} className="text-red-500 hover:text-red-700 ml-2">除外</button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <button 
                        onClick={handleAddToSongs} 
                        className={`font-bold py-2 px-4 rounded mt-4 w-full ${
                            isOverLimit 
                                ? 'bg-gray-300 cursor-not-allowed' 
                                : 'bg-green-500 hover:bg-green-700 text-white'
                        }`}
                        disabled={isOverLimit}
                    >
                        {isOverLimit ? '現在のプランの上限を超えています' : '曲リストに追加'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default YoutubePlaylistModal;
