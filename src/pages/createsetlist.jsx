import { useState, useContext } from 'react';
import { db } from '../../firebaseConfig';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { AuthContext } from '../context/AuthContext';
import { Sidebar } from "@/components/Sidebar"; // サイドバーをインポート
import SongTable from "@/components/SongTable"; // SongTable コンポーネントをインポート
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

function CreateSetlist() {
    const [searchCriteria, setSearchCriteria] = useState({ maxSung: 0, maxSungOption: '以上', tag: '', artist: '', genre: '', monetized: 'all', skillLevel: 0, skillLevelOption: '以上' });
    const [setlist, setSetlist] = useState([]);
    const [searchPerformed, setSearchPerformed] = useState(false);
    const [setlistName, setSetlistName] = useState(''); // セットリスト名の状態を追加
    const { currentUser } = useContext(AuthContext);

    const fetchSongs = async () => {
        if (!currentUser) {
            alert('ログインしてください');
            return;
        }

        setSearchPerformed(true);
        const songsRef = collection(db, 'users', currentUser.uid, 'Songs');
        let q = query(songsRef);
        if (searchCriteria.maxSungOption === '以下') {
            q = query(q, where('timesSung', '<=', searchCriteria.maxSung));
        } else {
            q = query(q, where('timesSung', '>=', searchCriteria.maxSung));
        }
        if (searchCriteria.tag) {
            q = query(q, where('tags', 'array-contains', searchCriteria.tag));
        }
        if (searchCriteria.artist) {
            q = query(q, where('artist', '==', searchCriteria.artist));
        }
        if (searchCriteria.genre) {
            q = query(q, where('genres', 'array-contains', searchCriteria.genre));
        }
        if (searchCriteria.monetized !== 'all') {
            q = query(q, where('monetized', '==', searchCriteria.monetized === 'yes'));
        }
        if (searchCriteria.skillLevelOption === '以下') {
            q = query(q, where('skillLevel', '<=', searchCriteria.skillLevel));
        } else {
            q = query(q, where('skillLevel', '>=', searchCriteria.skillLevel));
        }
        const querySnapshot = await getDocs(q);
        const songsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setSetlist(songsData);
    };

    const handleCriteriaChange = (field, value) => {
        setSearchCriteria(prev => ({ ...prev, [field]: value }));
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
        const setlistDoc = await addDoc(setlistRef, { name: setlistName, createdAt: new Date() });
        const songsRef = collection(db, 'users', currentUser.uid, 'Setlists', setlistDoc.id, 'Songs');
        for (const song of setlist) {
            await addDoc(songsRef, song);
        }
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
                <div className="flex flex-wrap gap-8 mb-8">
                    <div className="flex items-center gap-2">
                        <label className="whitespace-nowrap">歌唱回数:</label>
                        <input type="number" className="border p-2 rounded" value={searchCriteria.maxSung} onChange={(e) => handleCriteriaChange('maxSung', parseInt(e.target.value, 10))} />
                        <div className="flex gap-2">
                            <label><input type="radio" name="maxSungOption" value="以下" checked={searchCriteria.maxSungOption === '以下'} onChange={(e) => handleCriteriaChange('maxSungOption', e.target.value)} /> 以下</label>
                            <label><input type="radio" name="maxSungOption" value="以上" checked={searchCriteria.maxSungOption === '以上'} onChange={(e) => handleCriteriaChange('maxSungOption', e.target.value)} /> 以上</label>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="whitespace-nowrap">タグ:</label>
                        <input type="text" className="border p-2 rounded" value={searchCriteria.tag} onChange={(e) => handleCriteriaChange('tag', e.target.value)} />
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="whitespace-nowrap">アーティスト名:</label>
                        <input type="text" className="border p-2 rounded" value={searchCriteria.artist} onChange={(e) => handleCriteriaChange('artist', e.target.value)} />
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="whitespace-nowrap">ジャンル:</label>
                        <input type="text" className="border p-2 rounded" value={searchCriteria.genre} onChange={(e) => handleCriteriaChange('genre', e.target.value)} />
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="whitespace-nowrap">熟練度:</label>
                        <input type="number" className="border p-2 rounded" value={searchCriteria.skillLevel} onChange={(e) => handleCriteriaChange('skillLevel', parseInt(e.target.value, 10))} />
                        <div className="flex gap-2">
                            <label><input type="radio" name="skillLevelOption" value="以下" checked={searchCriteria.skillLevelOption === '以下'} onChange={(e) => handleCriteriaChange('skillLevelOption', e.target.value)} /> 以下</label>
                            <label><input type="radio" name="skillLevelOption" value="以上" checked={searchCriteria.skillLevelOption === '以上'} onChange={(e) => handleCriteriaChange('skillLevelOption', e.target.value)} /> 以上</label>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="whitespace-nowrap">収益化:</label>
                        <div className="flex gap-2">
                            <label><input type="radio" name="monetized" value="all" checked={searchCriteria.monetized === 'all'} onChange={(e) => handleCriteriaChange('monetized', e.target.value)} /> すべて</label>
                            <label><input type="radio" name="monetized" value="yes" checked={searchCriteria.monetized === 'yes'} onChange={(e) => handleCriteriaChange('monetized', e.target.value)} /> OK</label>
                            <label><input type="radio" name="monetized" value="no" checked={searchCriteria.monetized === 'no'} onChange={(e) => handleCriteriaChange('monetized', e.target.value)} /> NG</label>
                        </div>
                    </div>
                </div>
                <div className='flex justify-center mb-8'>
                    <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-40 rounded" onClick={fetchSongs}>検索</button>
                </div>
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
                    <div className='flex items-center flex-col gap-4'>
                        <div>
                            <label className='ml-2'>セットリスト名: </label>
                            <input type="text" className="border p-2 rounded" value={setlistName} onChange={(e) => setSetlistName(e.target.value)} />
                        </div>
                        <div>
                            <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-4 px-20 rounded" onClick={saveSetlist}>セットリストを保存</button>
                        </div>
                    </div>}
            </div>
        </div>
    );
}

export default CreateSetlist;



