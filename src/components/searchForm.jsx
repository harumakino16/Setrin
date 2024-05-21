import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useState } from 'react';
import { GoChevronDown } from 'react-icons/go'; // ReactIconのインポート
import { useSongs } from '../context/SongsContext';


const SearchForm = ({ currentUser, handleSearchResults, searchCriteria, setSearchCriteria }) => {
    const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
    const { songs } = useSongs();


    const searchSongs = async (searchCriteria) => {
        let songsData = songs;

        if (searchCriteria.freeKeyword) {
            songsData = songsData.filter(song =>
                song.title.includes(searchCriteria.freeKeyword) ||
                song.artist.includes(searchCriteria.freeKeyword) ||
                song.tags.some(tag => tag.includes(searchCriteria.freeKeyword)) || // タグの検索を修正
                song.genre.includes(searchCriteria.freeKeyword) ||
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
            songsData = songsData.filter(song => song.genre.includes(searchCriteria.genre));
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
        setSearchCriteria(prev => {
            const updatedCriteria = { ...prev, [field]: value };
            searchSongs(updatedCriteria); // 変更後の検索条件で検索を実行
            return updatedCriteria;
        });
    };

    return (
        <div>
            <div className="flex flex-col gap-8 mb-8">
                <div className="">
                    <label className="whitespace-nowrap">フリーキーワード:</label>
                    <input type="text" className="border p-2 rounded w-full h-14" placeholder="キーワードで検索" onChange={(e) => handleCriteriaChange('freeKeyword', e.target.value)} />
                </div>
                <div onClick={() => setShowAdvancedSearch(!showAdvancedSearch)} className="text-gray-500 py-2 px-4 cursor-pointer flex items-center">
                    <span className="text-gray-500">詳細検索</span> <span className="text-gray-500"><GoChevronDown size={20} /></span>
                </div>
                {showAdvancedSearch && (
                    <div className="flex flex-wrap gap-8">
                        {/* Advanced Search Options */}
                        <div className="flex flex-col gap-2">
                            <label className="whitespace-nowrap">歌唱回数:</label>
                            <input type="number" className="border p-2 rounded" value={searchCriteria.maxSung} onChange={(e) => handleCriteriaChange('maxSung', parseInt(e.target.value, 10))} />
                            <div className="flex gap-2 radio02">
                                <input type="radio" id="maxSungOptionBelow" name="maxSungOption" value="以下" checked={searchCriteria.maxSungOption === '以下'} onChange={(e) => handleCriteriaChange('maxSungOption', e.target.value)} />
                                <label htmlFor="maxSungOptionBelow">以下</label>
                                <input type="radio" id="maxSungOptionAbove" name="maxSungOption" value="以上" checked={searchCriteria.maxSungOption === '以上'} onChange={(e) => handleCriteriaChange('maxSungOption', e.target.value)} />
                                <label htmlFor="maxSungOptionAbove">以上</label>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="whitespace-nowrap">タグ:</label>
                            <input type="text" className="border p-2 rounded" value={searchCriteria.tag} onChange={(e) => handleCriteriaChange('tag', e.target.value)} />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="whitespace-nowrap">アーティスト名:</label>
                            <input type="text" className="border p-2 rounded" value={searchCriteria.artist} onChange={(e) => handleCriteriaChange('artist', e.target.value)} />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="whitespace-nowrap">ジャンル:</label>
                            <input type="text" className="border p-2 rounded" value={searchCriteria.genre} onChange={(e) => handleCriteriaChange('genre', e.target.value)} />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="whitespace-nowrap">熟練度:</label>
                            <input type="number" className="border p-2 rounded" value={searchCriteria.skillLevel} onChange={(e) => handleCriteriaChange('skillLevel', parseInt(e.target.value, 10))} />
                            <div className="flex gap-2 radio02">
                                <input type="radio" id="skillLevelOptionBelow" name="skillLevelOption" value="以下" checked={searchCriteria.skillLevelOption === '以下'} onChange={(e) => handleCriteriaChange('skillLevelOption', e.target.value)} />
                                <label htmlFor="skillLevelOptionBelow">以下</label>
                                <input type="radio" id="skillLevelOptionAbove" name="skillLevelOption" value="以上" checked={searchCriteria.skillLevelOption === '以上'} onChange={(e) => handleCriteriaChange('skillLevelOption', e.target.value)} />
                                <label htmlFor="skillLevelOptionAbove">以上</label>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="whitespace-nowrap">備考:</label>
                            <input type="text" className="border p-2 rounded" value={searchCriteria.memo} onChange={(e) => handleCriteriaChange('memo', e.target.value)} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default SearchForm;
