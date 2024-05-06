import { useState, useContext } from 'react';
import { db } from '../../firebaseConfig';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { AuthContext } from '../context/AuthContext';
import { Sidebar } from "@/components/Sidebar"; // サイドバーをインポート
import SongTable from "@/components/SongTable"; // SongTable コンポーネントをインポート
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import SearchForm from '@/components/searchForm';

function CreateSetlist() {
    const [setlistName, setSetlistName] = useState(''); // セットリスト名の状態を追加
    const { currentUser } = useContext(AuthContext);
    const [setlist, setSetlist] = useState([]);
    const [searchPerformed, setSearchPerformed] = useState(false);


    const handleSearchResults = (results) => {
        setSetlist(results);
        setSearchPerformed(true);

    };


    const saveSetlist = async () => {
        if (!currentUser) {
            alert('ログインしてください');
            return;
        }
        if (!setlistName) {
            alert('セットリスト名を入力してください');
            return;
        }

        const setlistRef = collection(db, 'users', currentUser.uid, 'Setlists');
        const songIds = setlist.map(song => song.id); // 曲のIDのリストを作成
        await addDoc(setlistRef, { name: setlistName, createdAt: new Date(), songIds: songIds });
        alert('セットリストを保存しました');
        // セットリスト保存後、検索前の状態にリセット
        setSetlist([]);
        setSearchPerformed(false);
        setSetlistName(''); // セットリスト名をリセット
    };


    return (
        <div className="flex">
            <Sidebar /> {/* サイドバーを表示 */}
            <div className="flex-grow p-8">
                <h1 className="text-2xl font-bold mb-4">セットリスト作成</h1>
                <SearchForm
                    currentUser={currentUser}
                    handleSearchResults={handleSearchResults}
                />

                <div className='mb-8'>
                    <DndProvider backend={HTML5Backend}>
                        <SongTable
                            songs={setlist}
                            setSongs={setSetlist}  // ここで setSongs 関数を渡す
                        />
                    </DndProvider>
                </div>
                {searchPerformed && setlist.length === 0 && <p>検索結果は0件です</p>}

                {searchPerformed && setlist.length > 0 &&
                    <div className='fixed bottom-0 left-0 w-full bg-gray-100 p-4 shadow-md'>
                        <div className='flex items-center flex-col gap-4'>
                            <div>
                                <label className='ml-2'>セットリスト名: </label>
                                <input type="text" className="border p-2 rounded" value={setlistName} onChange={(e) => setSetlistName(e.target.value)} />
                            </div>
                            <div>
                                <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-4 px-20 rounded" onClick={saveSetlist}>セットリストを保存</button>
                            </div>
                        </div>
                    </div>}
            </div>
        </div>
    );
}

export default CreateSetlist;



