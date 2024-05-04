import { db } from '../../firebaseConfig';
import Modal from './modal';
import { useEffect, useState } from 'react';
import { collection, getDocs, doc, writeBatch, getDoc } from 'firebase/firestore';
import fetchUsersSetlists from '../hooks/fetchUsersSetlists';
import { useMessage } from '../context/MessageContext';


function AddSongsInSetlistModal({ isOpen, setIsOpen, onSongsUpdated, selectedSongs, onClose, currentUser }) {

    const [usersSetlists, setUsersSetlists] = useState([]);
    const [selectedSetlists, setSelectedSetlists] = useState([]);
    const { setMessageInfo } = useMessage();


    useEffect(() => {
        async function fetchSetlists() {
            await fetchUsersSetlists(currentUser,setUsersSetlists);
            console.log(usersSetlists);
        }
        fetchSetlists();
    }, [currentUser]);

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
            onSongsUpdated(); // 更新後のコールバックを呼び出す
            setMessageInfo({ message: '曲がセットリストに追加されました。', type: 'success' });
        } catch (error) {
            console.error('曲をセットリストに追加中にエラーが発生しました:', error);
            setMessageInfo({ message: '曲の追加に失敗しました。', type: 'error' });
        }
        onClose();

    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="overflow-y-auto">
                <h2 className="text-2xl font-bold mb-4">セットリストに曲を追加</h2>
                <ul className="space-y-4 p-4">
                    {usersSetlists.map(setlist => (
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
                        追加
                    </button>
                </div>
            </div>
            
        </Modal>
    );
}

export default AddSongsInSetlistModal;
