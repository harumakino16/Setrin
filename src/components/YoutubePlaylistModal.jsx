import { useState, useContext } from 'react';
import { db } from '../../firebaseConfig';
import { collection, addDoc, writeBatch, doc } from 'firebase/firestore';
import { useMessage } from '@/context/MessageContext';
import { AuthContext } from '@/context/AuthContext';
import { formatSongData } from '../utils/songUtils';

const YoutubePlaylistModal = ({ isOpen, onClose }) => {
    const { currentUser } = useContext(AuthContext);
    const { setMessageInfo } = useMessage();
    const [playlistUrl, setPlaylistUrl] = useState('');
    const [importedSongs, setImportedSongs] = useState([]);
    const [editingSong, setEditingSong] = useState(null);
    const [editedTitle, setEditedTitle] = useState('');
    const [editedArtist, setEditedArtist] = useState('');
    const [editedSingingCount, setEditedSingingCount] = useState(0);
    const [editedProficiency, setEditedProficiency] = useState(0);
    const [editedNotes, setEditedNotes] = useState('');
    const [editedTags, setEditedTags] = useState("");
    const [editedGenre, setEditedGenre] = useState('');

    const handleImport = async () => {
        try {
            const response = await fetch('/api/importPlaylist', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ playlistUrl, currentUser }),
            });

            if (!response.ok) {
                throw new Error('Failed to import playlist');
            }

            const data = await response.json();
            setImportedSongs(data.items);
            setMessageInfo({ message: '再生リストがインポートされました', type: 'success' });
        } catch (error) {
            console.error('Error importing playlist:', error);
            setMessageInfo({ message: '再生リストのインポートに失敗しました', type: 'error' });
        }
    };
    console.log(importedSongs);

    const handleDeleteSong = (songId) => {
        setImportedSongs(importedSongs.filter(song => song.youtubeUrl !== songId));
    };

    const handleAddToSongs = async () => {
        try {
            const batch = writeBatch(db);
            console.log(importedSongs);
            importedSongs.forEach(song => {
                const songData = formatSongData(song);
                console.log(song);
                console.log(songData);
                const songRef = doc(db, 'users', currentUser.uid, 'Songs', encodeURIComponent(song.youtubeUrl).replace(/\./g, '%2E'));
                batch.set(songRef, songData);
            });
            await batch.commit();
            setMessageInfo({ message: '曲が追加されました', type: 'success' });
            onClose();
        } catch (error) {
            console.error('Error adding songs:', error);
            setMessageInfo({ message: error.message, type: 'error' });
        }
    };

    const handleEditSong = (song) => {
        setEditingSong(song);
        setEditedTitle(song.title);
        setEditedArtist(song.artist);
        setEditedSingingCount(song.singingCount || '');
        setEditedProficiency(song.proficiency || '');
        setEditedNotes(song.notes || '');
        setEditedTags(song.tags || '');
        setEditedGenre(song.genre || '');
    };

    const handleSaveEdit = () => {
        setImportedSongs(importedSongs.map(song => 
            song.youtubeUrl === editingSong.youtubeUrl ? { ...song, title: editedTitle, artist: editedArtist, singingCount: editedSingingCount, proficiency: editedProficiency, notes: editedNotes, tags: editedTags.split(',').slice(0, 3).join(','), genre: editedGenre } : song
        ));
        setEditingSong(null);
    };

    return (
        <div>
            <h2 className="text-xl font-bold mb-4">Youtube再生リストから追加</h2>
            <input
                type="text"
                value={playlistUrl}
                onChange={(e) => setPlaylistUrl(e.target.value)}
                placeholder="再生リストのURLを入力"
                className="border p-2 rounded w-full mb-4"
            />
            <button onClick={handleImport} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full">
                インポート
            </button>
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
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">備考</th>
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
                                                    value={editedProficiency}
                                                    onChange={(e) => setEditedProficiency(e.target.value)}
                                                    className="border p-2 rounded w-full"
                                                />
                                            ) : (
                                                song.proficiency
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {editingSong && editingSong.youtubeUrl === song.youtubeUrl ? (
                                                <input
                                                    type="text"
                                                    value={editedNotes}
                                                    onChange={(e) => setEditedNotes(e.target.value)}
                                                    className="border p-2 rounded w-full"
                                                />
                                            ) : (
                                                song.notes
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
                    <button onClick={handleAddToSongs} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mt-4 w-full">
                        曲リストに追加
                    </button>
                </div>
            )}
        </div>
    );
};

export default YoutubePlaylistModal;