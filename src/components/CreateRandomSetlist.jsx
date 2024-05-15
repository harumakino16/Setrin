import { useState, useContext } from 'react';
import { db } from '../../firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import { AuthContext } from '@/context/AuthContext';
import SearchForm from '@/components/searchForm';
import Modal from '@/components/modal.jsx'; // Modal コンポーネントをインポート

export default function CreateRandomSetlist({ isOpen, onClose }) {
    const { currentUser } = useContext(AuthContext);
    const [searchResults, setSearchResults] = useState([]);
    const [numberOfSongs, setNumberOfSongs] = useState(0); // 曲数を指定するためのstate

    const handleSearchResults = (results) => {
        setSearchResults(results);
        setNumberOfSongs(30); // 検索結果の曲数が指定曲数より少ない場合、上限を検索結果の曲数に設定
        if (results.length < numberOfSongs) {
            setNumberOfSongs(results.length); // 検索結果の曲数が指定曲数より少ない場合、上限を検索結果の曲数に設定
        }
    };

    const createRandomSetlist = async () => {
        if (searchResults.length === 0) {
            alert('検索結果がありません。');
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
            await addDoc(setlistsRef, setlistData);
            alert('セットリストが作成されました。');
        } catch (error) {
            console.error('セットリストの保存に失敗しました:', error);
            alert('セットリストの保存に失敗しました。');
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="flex flex-col gap-2 min-w-[600px]">
                <h2 className="text-xl font-bold text-blue-600 underline decoration-dashed decoration-blue-300">STEP1 条件を指定する</h2>
                <SearchForm currentUser={currentUser} handleSearchResults={handleSearchResults} />
                <div className="text-sm text-gray-600 mt-2">
                    {`検索結果: ${searchResults.length} 件`}
                </div>
                <h2 className="text-xl font-bold text-green-600 underline decoration-dotted decoration-green-300">STEP2 出力する曲数を指定する</h2>
                <div className="mt-2">
                    <div className="flex justify-center items-center">
                        <label htmlFor="numberOfSongs" className="mr-2">出力する曲数:</label>
                        <input type="number" id="numberOfSongs" value={numberOfSongs} onChange={(e) => setNumberOfSongs(Math.min(parseInt(e.target.value, 10), searchResults.length))} className="border p-1 rounded h-12" />
                    </div>
                </div>
                <button onClick={createRandomSetlist} className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    ランダムセットリストを作成
                </button>
            </div>
        </Modal>
    );
}
