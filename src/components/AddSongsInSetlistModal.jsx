import { db } from '../../firebaseConfig';
import Modal from './Modal';
import { useEffect, useState, useContext } from 'react';
import { collection, getDocs, doc, writeBatch, getDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import fetchUsersSetlists from '../hooks/fetchSetlists';
import { useMessage } from '../context/MessageContext';
import { AuthContext } from '@/context/AuthContext';

function AddSongsInSetlistModal({ isOpen, onSongsUpdated, selectedSongs, onClose, currentUser }) {

    const [selectedSetlists, setSelectedSetlists] = useState([]);
    const [newSetlistName, setNewSetlistName] = useState('');
    const { setMessageInfo } = useMessage();
    const { setlists } = fetchUsersSetlists(currentUser);

    const handleCheckboxChange = (setlistId) => {
        setSelectedSetlists(prev => {
            if (prev.includes(setlistId)) {
                return prev.filter(id => id !== setlistId);
            } else {
                return [...prev, setlistId];
            }
        });
    };

    const handleAddSongsToSetlists = async () => {
        const batch = writeBatch(db);

        for (const setlistId of selectedSetlists) {
            const setlistRef = doc(db, 'users', currentUser.uid, 'Setlists', setlistId);
            const setlistDoc = await getDoc(setlistRef);
            if (setlistDoc.exists()) {
                const existingSongs = setlistDoc.data().songIds || [];
                const updatedSongs = [...new Set([...existingSongs, ...selectedSongs])]; // 重複を避けるためにSetを使用
                batch.update(setlistRef, { songIds: updatedSongs });
            }
        }

        try {
            await batch.commit();
            setMessageInfo({ message: '曲がセットリストに追加されました。', type: 'success' });
            onSongsUpdated(); // セットリスト更新を通知
        } catch (error) {
            console.error('曲をセットリストに追加中にエラーが発生しました:', error);
            setMessageInfo({ message: '曲の追加に失敗しました。', type: 'error' });
        }
        onClose();
    };

    const handleCreateAndAddSongsToNewSetlist = async () => {
        if (newSetlistName.trim() === '') {
            setMessageInfo({ message: 'セットリスト名を入力してください。', type: 'error' });
            return;
        }

        try {
            const setlistRef = collection(db, 'users', currentUser.uid, 'Setlists');
            const newSetlistDoc = await addDoc(setlistRef, {
                name: newSetlistName,
                songIds: selectedSongs,
                createdAt: serverTimestamp()
            });

            setMessageInfo({ message: '新しいセットリストが作成され、曲が追加されました。', type: 'success' });
            onClose();
        } catch (error) {
            console.error('新しいセットリストの作成中にエラーが発生しました:', error);
            setMessageInfo({ message: '新しいセットリストの作成に失敗しました。', type: 'error' });
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="overflow-y-auto">
                <h2 className="text-2xl font-bold mb-4">セットリストに曲を追加</h2>
                <ul className="space-y-4 p-4">
                    {setlists.map(setlist => (
                        <li key={setlist.id}>
                            <label className="flex items-center">
                                <input type="checkbox" className="form-checkbox w-5 h-5 text-blue-600 bg-gray-100 rounded border-gray-300" checked={selectedSetlists.includes(setlist.id)} onChange={() => handleCheckboxChange(setlist.id)} />
                                <span className="ml-2">{setlist.name}</span>
                            </label>
                        </li>
                    ))}
                </ul>
                <div className="mt-4 p-4">
                    <button
                        className={`flex items-center justify-center w-full p-2 mt-4 rounded ${selectedSetlists.length === 0 ? 'bg-gray-300' : 'bg-blue-500 hover:bg-blue-600 text-white font-bold'}`}
                        onClick={selectedSetlists.length === 0 ? undefined : handleAddSongsToSetlists}
                        disabled={selectedSetlists.length === 0}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        既存のセットリストに追加
                    </button>
                </div>
                <div className="mt-4 p-4">
                    <h2 className="text-xl font-bold mb-4">新しいセットリストを作成</h2>
                    <input
                        type="text"
                        value={newSetlistName}
                        onChange={(e) => setNewSetlistName(e.target.value)}
                        placeholder="セットリスト名を入力"
                        className="border p-2 rounded w-full mb-4"
                    />
                    <button
                        className="flex items-center justify-center w-full p-2 mt-4 rounded bg-green-500 hover:bg-green-600 text-white font-bold"
                        onClick={handleCreateAndAddSongsToNewSetlist}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        新しいセットリストを作成
                    </button>
                </div>
            </div>
        </Modal>
    );
}

export default AddSongsInSetlistModal;
