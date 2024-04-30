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
                <div className="mb-6">
                    <label className="block mb-2 mt-4">歌唱回数: </label>
                    <input type="number" className="border p-2 rounded" value={searchCriteria.maxSung} onChange={(e) => handleCriteriaChange('maxSung', parseInt(e.target.value, 10))} />
                    <div className="mt-2">
                        <label><input type="radio" name="maxSungOption" value="以下" checked={searchCriteria.maxSungOption === '以下'} onChange={(e) => handleCriteriaChange('maxSungOption', e.target.value)} /> 以下</label>
                        <label><input type="radio" name="maxSungOption" value="以上" checked={searchCriteria.maxSungOption === '以上'} onChange={(e) => handleCriteriaChange('maxSungOption', e.target.value)} /> 以上</label>
                    </div>
                    <label className="block mb-2 mt-4">タグ: </label>
                    <input type="text" className="border p-2 rounded" value={searchCriteria.tag} onChange={(e) => handleCriteriaChange('tag', e.target.value)} />
                    <label className="block mb-2 mt-4">アーティスト名: </label>
                    <input type="text" className="border p-2 rounded" value={searchCriteria.artist} onChange={(e) => handleCriteriaChange('artist', e.target.value)} />
                    <label className="block mb-2 mt-4">ジャンル: </label>
                    <input type="text" className="border p-2 rounded" value={searchCriteria.genre} onChange={(e) => handleCriteriaChange('genre', e.target.value)} />
                    <label className="block mb-2 mt-4">熟練度: </label>
                    <input type="number" className="border p-2 rounded" value={searchCriteria.skillLevel} onChange={(e) => handleCriteriaChange('skillLevel', parseInt(e.target.value, 10))} />
                    <div className="mt-2">
                        <label><input type="radio" name="skillLevelOption" value="以下" checked={searchCriteria.skillLevelOption === '以下'} onChange={(e) => handleCriteriaChange('skillLevelOption', e.target.value)} /> 以下</label>
                        <label><input type="radio" name="skillLevelOption" value="以上" checked={searchCriteria.skillLevelOption === '以上'} onChange={(e) => handleCriteriaChange('skillLevelOption', e.target.value)} /> 以上</label>
                    </div>
                    <div className="mt-4">
                        <label className="block mb-2">収益化: </label>
                        <label><input type="radio" name="monetized" value="all" checked={searchCriteria.monetized === 'all'} onChange={(e) => handleCriteriaChange('monetized', e.target.value)} /> すべて</label>
                        <label><input type="radio" name="monetized" value="yes" checked={searchCriteria.monetized === 'yes'} onChange={(e) => handleCriteriaChange('monetized', e.target.value)} /> OK</label>
                        <label><input type="radio" name="monetized" value="no" checked={searchCriteria.monetized === 'no'} onChange={(e) => handleCriteriaChange('monetized', e.target.value)} /> NG</label>
                    </div>
                    <button className="bg-blue-500 text-white px-4 py-2 rounded mt-4" onClick={fetchSongs}>検索</button>
                </div>
                <div className="mb-6">

                    <DndProvider backend={HTML5Backend}>
                        <SongTable
                            songs={setlist}
                            setSongs={setSetlist}  // ここで setSongs 関数を渡す
                        />
                    </DndProvider>
                </div>
                {searchPerformed && setlist.length === 0 && <p className='text-center'>検索結果は0件です</p>}
                <label className="block">セットリスト名: </label>
                <input type="text" className="border p-2 rounded mr-4" value={setlistName} onChange={(e) => setSetlistName(e.target.value)} />
                {searchPerformed && setlist.length > 0 && <button className="bg-green-500 text-white px-4 py-2 rounded mt-4" onClick={saveSetlist}>セットリストを保存</button>}
            </div>
        </div>
    );
}

export default CreateSetlist;



