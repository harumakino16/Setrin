import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useState } from 'react';


const SearchForm = ({ currentUser, handleSearchResults }) => {
    const [setlist, setSetlist] = useState([]);
    const [searchCriteria, setSearchCriteria] = useState({ maxSung: 0, maxSungOption: '以上', tag: '', artist: '', genre: '', monetized: 'all', skillLevel: 0, skillLevelOption: '以上' });


    const fetchSongs = async () => {
        if (!currentUser) {
            alert('ログインしてください');
            return;
        }

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
        handleSearchResults(songsData);
    };

    const handleCriteriaChange = (field, value) => {
        setSearchCriteria(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div>
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
        </div>
    )
}

export default SearchForm;

