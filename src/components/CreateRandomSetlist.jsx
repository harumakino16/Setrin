import { useState, useContext } from 'react';
import { useRouter } from 'next/router';
import { db } from '../../firebaseConfig';
import { collection, addDoc, getDocs, updateDoc, doc, getDoc } from 'firebase/firestore';
import { AuthContext } from '@/context/AuthContext';
import { useMessage } from '@/context/MessageContext'; // MessageContextをインポート
import SearchForm from '@/components/searchForm';
import Modal from '@/components/modal.jsx'; // Modal コンポーネントをインポート
import useSearchCriteria from '@/hooks/useSearchCriteria'; // カスタムフックをインポート    
import fetchUsersSetlists from '../hooks/fetchSetlists'; // fetchUsersSetlistsをインポート

export default function CreateRandomSetlist({ isOpen, onClose }) {
    const { currentUser } = useContext(AuthContext);
    const { setMessageInfo } = useMessage(); // setMessageInfoを取得
    const [searchResults, setSearchResults] = useState([]);
    const [numberOfSongs, setNumberOfSongs] = useState(0); // 曲数を指定するためのstate
    const router = useRouter();
    const { searchCriteria, setSearchCriteria } = useSearchCriteria({}); // カスタムフックを使用
    const { setlists: existingSetlists } = fetchUsersSetlists(currentUser); // fetchUsersSetlistsを使用
    const [isSetlistModalOpen, setIsSetlistModalOpen] = useState(false);
    const [selectedSetlists, setSelectedSetlists] = useState([]); // 選択されたセットリストのstate

    const handleSearchResults = (results) => {
        setSearchResults(results);
        setNumberOfSongs(30); // 検索結果の曲数が指定曲数より少ない場合、上限を検索結果の曲数に設定
        if (results.length < numberOfSongs) {
            setNumberOfSongs(results.length); // 検索結果の曲数が指定曲数より少ない場合、上限を検索結果の曲数に設定
        }
    };

    const createRandomSetlist = async () => {
        if (searchResults.length === 0) {
            setMessageInfo({ type: 'error', message: '検索結果がありません。' });
            return;
        }

        const randomSongs = searchResults.sort(() => 0.5 - Math.random()).slice(0, numberOfSongs); // 指定された曲数でランダムに選択
        const setlistData = {
            name: `ランダムセットリスト - ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
            songIds: randomSongs.map(song => song.id),
            createdAt: new Date()
        };

        try {
            const setlistsRef = collection(db, `users/${currentUser.uid}/Setlists`);
            const docRef = await addDoc(setlistsRef, setlistData);
            setMessageInfo({ type: 'success', message: 'セットリストが作成されました。' });
            router.push(`/setlist/${docRef.id}`);
        } catch (error) {
            console.error('セットリストの保存に失敗しました:', error);
            setMessageInfo({ type: 'error', message: 'セットリストの保存に失敗しました。' });
        }
    };

    const handleAddToExistingSetlist = async () => {
        setIsSetlistModalOpen(true);
    };

    const handleSetlistSelection = (setlistId) => {
        setSelectedSetlists(prevSelected => {
            if (prevSelected.includes(setlistId)) {
                return prevSelected.filter(id => id !== setlistId);
            } else {
                return [...prevSelected, setlistId];
            }
        });
    };

    const addToSelectedSetlists = async () => {
        try {
            for (const setlistId of selectedSetlists) {
                const setlistRef = doc(db, `users/${currentUser.uid}/Setlists`, setlistId);
                const setlistDoc = await getDoc(setlistRef);
                const setlistData = setlistDoc.data();
                const updatedSongIds = [...new Set([...(setlistData.songIds || []), ...searchResults.map(song => song.id)])];
                await updateDoc(setlistRef, { songIds: updatedSongIds });
            }
            setMessageInfo({ type: 'success', message: 'セットリストに曲が追加されました。' });
            setIsSetlistModalOpen(false);
            router.push(`/setlist/${selectedSetlists[0]}`);
        } catch (error) {
            console.error('セットリストへの追加に失敗しました:', error);
            setMessageInfo({ type: 'error', message: 'セットリストへの追加に失敗しました。' });
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="flex flex-col gap-2 min-w-[600px]">
                <h2 className=" text-2xl font-bold text-blue-600 text-center">セトリを作る</h2>
                <SearchForm
                    currentUser={currentUser}
                    handleSearchResults={handleSearchResults}
                    searchCriteria={searchCriteria}
                    setSearchCriteria={setSearchCriteria}
                />
                <div className="text-sm text-gray-600 mt-2">
                    {`検索結果: ${searchResults.length} 件`}
                </div>
                <div className="flex flex-col gap-2 mt-4">
                    <label className="text-sm text-gray-600">出力する曲数を選択してください:</label>
                    <input
                        type="number"
                        value={numberOfSongs}
                        onChange={(e) => setNumberOfSongs(parseInt(e.target.value, 10))}
                        className="border p-2 rounded w-full"
                        min="1"
                        max={searchResults.length}
                    />
                </div>
                <button onClick={createRandomSetlist} className="mt-4 text-lg bg-blue-500 hover:bg-blue-700 text-white font-bold py-5 px-4 rounded">
                    ランダムセットリストを作成
                </button>
                <button onClick={handleAddToExistingSetlist} className="mt-2 bg-gray-300 hover:bg-gray-400 text-black py-2 px-4 rounded">
                    既存のセットリストに追加する
                </button>
            </div>
            {isSetlistModalOpen && (
                <Modal isOpen={isSetlistModalOpen} onClose={() => setIsSetlistModalOpen(false)}>
                    <div className="flex flex-col gap-2 min-w-[400px]">
                        <h2 className="text-xl font-bold text-blue-600 text-center">既存のセットリスト</h2>
                        <ul>
                            {existingSetlists.map(setlist => (
                                <li
                                    key={setlist.id}
                                    className="border-b py-2 flex items-center cursor-pointer"
                                    onClick={() => handleSetlistSelection(setlist.id)}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedSetlists.includes(setlist.id)}
                                        onChange={() => handleSetlistSelection(setlist.id)}
                                        className="mr-2"
                                    />
                                    {setlist.name}
                                </li>
                            ))}
                        </ul>
                        <button onClick={addToSelectedSetlists} className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                            選択したセットリストに追加
                        </button>
                    </div>
                </Modal>
            )}
        </Modal>
    );
}
