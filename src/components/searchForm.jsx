import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useState } from 'react';
import { GoChevronDown } from 'react-icons/go'; // ReactIconのインポート
import { useSongs } from '../context/SongsContext';


const SearchForm = ({ currentUser, handleSearchResults }) => {
    const [searchCriteria, setSearchCriteria] = useState({ freeKeyword: '', maxSung: 0, maxSungOption: '以上', tag: '', artist: '', genre: '', skillLevel: 0, skillLevelOption: '以上', memo: '' });
    const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
    const { songs } = useSongs();


    const searchSongs = async () => {
        let songsData = songs;

        if (searchCriteria.freeKeyword) {
            songsData = songsData.filter(song => 
                song.title.includes(searchCriteria.freeKeyword) ||
                song.artist.includes(searchCriteria.freeKeyword) ||
                song.tags.includes(searchCriteria.freeKeyword) ||
                song.genres.includes(searchCriteria.freeKeyword) ||
                song.skillLevel.toString().includes(searchCriteria.freeKeyword) ||
                song.memo.includes(searchCriteria.freeKeyword)
            );
        }

        if (searchCriteria.maxSung > 0) {
            if (searchCriteria.maxSungOption === '以上') {
                songsData = songsData.filter(song => song.timesSung >= searchCriteria.maxSung);
            } else {
                songsData = songsData.filter(song => song.timesSung <= searchCriteria.maxSung);
            }
        }

        if (searchCriteria.tag) {
            songsData = songsData.filter(song => song.tags.includes(searchCriteria.tag));
        }

        if (searchCriteria.artist) {
            songsData = songsData.filter(song => song.artist.includes(searchCriteria.artist));
        }

        if (searchCriteria.genre) {
            songsData = songsData.filter(song => song.genres.includes(searchCriteria.genre));
        }

        if (searchCriteria.skillLevel > 0) {
            if (searchCriteria.skillLevelOption === '以上') {
                songsData = songsData.filter(song => song.skillLevel >= searchCriteria.skillLevel);
            } else {
                songsData = songsData.filter(song => song.skillLevel <= searchCriteria.skillLevel);
            }
        }

        if (searchCriteria.memo) {
            songsData = songsData.filter(song => song.memo.includes(searchCriteria.memo));
        }

        handleSearchResults(songsData);
    };

    const handleCriteriaChange = (field, value) => {
        setSearchCriteria(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div>
            <div className="flex flex-wrap gap-8 mb-8">
                <div className="w-full mb-4">
                    <label className="whitespace-nowrap">フリーキーワード:</label>
                    <input type="text" className="border p-2 rounded w-full" placeholder="キーワードで検索" onChange={(e) => handleCriteriaChange('freeKeyword', e.target.value)} />
                </div>
                <div onClick={() => setShowAdvancedSearch(!showAdvancedSearch)} className="text-gray-500 font-bold py-2 px-4 cursor-pointer flex items-center">
                    <span className="text-gray-500">詳細検索</span> <span className="text-gray-500"><GoChevronDown size={20} /></span>
                </div>
                {showAdvancedSearch && (
                    <div className="flex flex-wrap gap-8">
                        {/* Advanced Search Options */}
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
                            <label className="whitespace-nowrap">備考:</label>
                            <input type="text" className="border p-2 rounded" value={searchCriteria.memo} onChange={(e) => handleCriteriaChange('memo', e.target.value)} />
                        </div>
                    </div>
                )}
            </div>
            <div className='flex justify-center mb-8'>
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-40 rounded" onClick={searchSongs}>検索</button>
            </div>
        </div>
    )
}

export default SearchForm;


