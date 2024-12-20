import { db } from '../../firebaseConfig';
import Modal from './Modal';
import {useState} from 'react';
import { collection, getDocs, doc, writeBatch, getDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import fetchUsersSetlists from '../hooks/fetchSetlists';
import { useMessage } from '../context/MessageContext';
import { AuthContext } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
function AddSongsInSetlistModal({ isOpen, selectedSongs, onClose, currentUser }) {

    const [selectedSetlists, setSelectedSetlists] = useState([]);
    const [newSetlistName, setNewSetlistName] = useState('');
    const { setMessageInfo } = useMessage();
    const { setlists } = fetchUsersSetlists(currentUser);
    const { theme } = useTheme();
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
        } catch (error) {
            
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
            
            setMessageInfo({ message: '新しいセットリストの作成に失敗しました。', type: 'error' });
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className={`overflow-y-auto p-6 max-w-2xl mx-auto ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                <h2 className="text-2xl font-bold mb-6 pb-2 border-b">セットリストに曲を追加</h2>
                
                {setlists.length > 0 && (
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold mb-4">既存のセットリスト</h3>
                        <ul className="space-y-3 max-h-60 overflow-y-auto pr-2">
                            {setlists.map(setlist => (
                                <li key={setlist.id} 
                                    className={`p-3 rounded-lg transition-all duration-200 ${
                                        selectedSetlists.includes(setlist.id) 
                                            ? 'bg-blue-50 dark:bg-blue-900/30' 
                                            : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                                    }`}
                                >
                                    <label className="flex items-center cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            className="w-5 h-5 rounded-md text-blue-600 border-gray-300 focus:ring-blue-500 transition-all duration-200" 
                                            checked={selectedSetlists.includes(setlist.id)} 
                                            onChange={() => handleCheckboxChange(setlist.id)} 
                                        />
                                        <span className="ml-3 font-medium">{setlist.name}</span>
                                    </label>
                                </li>
                            ))}
                        </ul>
                        
                        <button
                            className={`w-full mt-4 px-6 py-3 rounded-lg transition-all duration-200 ${
                                selectedSetlists.length === 0 
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800' 
                                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                            }`}
                            onClick={selectedSetlists.length === 0 ? undefined : handleAddSongsToSetlists}
                            disabled={selectedSetlists.length === 0}
                        >
                            <div className="flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                選択したセットリストに追加
                            </div>
                        </button>
                    </div>
                )}

                <div className="pt-6 border-t">
                    <h3 className="text-lg font-semibold mb-4">新しいセットリストを作成</h3>
                    <input
                        type="text"
                        value={newSetlistName}
                        onChange={(e) => setNewSetlistName(e.target.value)}
                        placeholder="セットリスト名を入力"
                        className={`w-full px-4 py-3 rounded-lg border ${
                            theme === 'dark' 
                                ? 'bg-gray-800 border-gray-700 text-white' 
                                : 'bg-white border-gray-300'
                        } focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200`}
                    />
                    
                    <button
                        className={`w-full mt-4 px-6 py-3 rounded-lg transition-all duration-200 ${
                            newSetlistName.trim() === '' 
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800' 
                                : 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl'
                        }`}
                        onClick={handleCreateAndAddSongsToNewSetlist}
                        disabled={newSetlistName.trim() === ''}
                    >
                        <div className="flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            新規セットリストを作成
                        </div>
                    </button>
                </div>
            </div>
        </Modal>
    );
}

export default AddSongsInSetlistModal;
