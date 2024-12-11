// SearchForm.jsx
import { useState, useEffect } from 'react';
import { GoChevronDown, GoChevronUp } from 'react-icons/go'; // ReactIconのインポート
import { useSongs } from '../context/SongsContext';
import { convertKanaToHira, convertHiraToKana } from '../utils/stringUtils';

const SearchForm = ({ currentUser, handleSearchResults, searchCriteria, setSearchCriteria, isRandomSetlist }) => {
    const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
    const { songs } = useSongs();

    const searchSongs = async (searchCriteria) => {
        let songsData = songs;

        if (searchCriteria.freeKeyword) {
            const keywordLower = searchCriteria.freeKeyword.toLowerCase();
            const keywordHira = convertKanaToHira(keywordLower);
            songsData = songsData.filter(song =>
                song.title.toLowerCase().includes(keywordLower) ||
                song.artist.toLowerCase().includes(keywordLower) ||
                song.tags.some(tag => tag.toLowerCase().includes(keywordLower)) ||
                song.genre.toLowerCase().includes(keywordLower) ||
                song.skillLevel.toString().toLowerCase().includes(keywordLower) ||
                (song.memo && song.memo.toLowerCase().includes(keywordLower)) ||
                (song.furigana && convertKanaToHira(song.furigana.toLowerCase()).includes(keywordHira))
            );
        }

        if (searchCriteria.maxSung > 0) {
            if (searchCriteria.maxSungOption === '以上') {
                songsData = songsData.filter(song => song.singingCount >= searchCriteria.maxSung);
            } else {
                songsData = songsData.filter(song => song.singingCount <= searchCriteria.maxSung);
            }
        }

        if (searchCriteria.tag) {
            const tagLower = searchCriteria.tag.toLowerCase();
            songsData = songsData.filter(song => song.tags.map(tag => tag.toLowerCase()).includes(tagLower));
        }

        if (searchCriteria.artist) {
            const artistLower = searchCriteria.artist.toLowerCase();
            songsData = songsData.filter(song => song.artist.toLowerCase().includes(artistLower));
        }

        if (searchCriteria.genre) {
            const genreLower = searchCriteria.genre.toLowerCase();
            songsData = songsData.filter(song => song.genre.toLowerCase().includes(genreLower));
        }

        if (searchCriteria.skillLevel > 0) {
            if (searchCriteria.skillLevelOption === '以上') {
                songsData = songsData.filter(song => song.skillLevel >= searchCriteria.skillLevel);
            } else {
                songsData = songsData.filter(song => song.skillLevel <= searchCriteria.skillLevel);
            }
        }

        if (searchCriteria.memo) {
            const memoLower = searchCriteria.memo.toLowerCase();
            songsData = songsData.filter(song => song.memo.toLowerCase().includes(memoLower));
        }

        if (searchCriteria.excludedTags) {
            const excludedTags = searchCriteria.excludedTags.split(',').map(tag => tag.trim().toLowerCase());
            songsData = songsData.filter(song => 
                !song.tags.some(tag => excludedTags.includes(tag.toLowerCase()))
            );
        }

        if (searchCriteria.excludedGenres) {
            const excludedGenres = searchCriteria.excludedGenres.split(',').map(genre => genre.trim().toLowerCase());
            songsData = songsData.filter(song => 
                !excludedGenres.includes(song.genre.toLowerCase())
            );
        }

        handleSearchResults(songsData);
    };

    useEffect(() => {
        searchSongs(searchCriteria); // 現在の検索条件を使用

    }, [songs, searchCriteria]);

    const handleCriteriaChange = (field, value) => {
        setSearchCriteria(prev => {
            const updatedCriteria = { ...prev, [field]: value };
            searchSongs(updatedCriteria);
            return updatedCriteria;
        });
    };


    return (
        <div>
            <div className="flex flex-col gap-8 mb-8">
                <div className="">
                    <label className="whitespace-nowrap">フリーキーワード:</label>
                    <input
                        type="text"
                        className="border p-2 rounded w-full h-14"
                        placeholder="キーワードで検索"
                        value={searchCriteria.freeKeyword}
                        onChange={(e) => handleCriteriaChange('freeKeyword', e.target.value)}
                    />
                </div>
                <div onClick={() => setShowAdvancedSearch(!showAdvancedSearch)} className="text-gray-500 py-2 px-4 cursor-pointer flex items-center">
                    <span className="text-gray-500">{isRandomSetlist ? '絞り込み' : '詳細検索'}</span> 
                    <span className="text-gray-500">
                        {showAdvancedSearch ? <GoChevronUp size={20} /> : <GoChevronDown size={20} />}
                    </span>
                </div>
                {showAdvancedSearch && (
                    <div className="flex flex-wrap gap-8">
                        <div className="w-full">
                            <div className="p-4 bg-white shadow rounded-lg">
                                <h3 className="font-bold mb-4">絞り込み</h3>
                                <div className="flex flex-wrap gap-4">
                                    <div className="flex flex-col">
                                        <label className="whitespace-nowrap">歌唱回数:</label>
                                        <input type="number" className="border p-2 rounded mb-4" value={searchCriteria.maxSung} onChange={(e) => handleCriteriaChange('maxSung', parseInt(e.target.value, 10))} />
                                        <div className="flex gap-2 radio02 mb-4">
                                            <input type="radio" id="maxSungOptionBelow" name="maxSungOption" value="以下" checked={searchCriteria.maxSungOption === '以下'} onChange={(e) => handleCriteriaChange('maxSungOption', e.target.value)} />
                                            <label htmlFor="maxSungOptionBelow">以下</label>
                                            <input type="radio" id="maxSungOptionAbove" name="maxSungOption" value="以上" checked={searchCriteria.maxSungOption === '以上'} onChange={(e) => handleCriteriaChange('maxSungOption', e.target.value)} />
                                            <label htmlFor="maxSungOptionAbove">以上</label>
                                        </div>
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="whitespace-nowrap">タグ:</label>
                                        <input 
                                            type="text" 
                                            className="border p-2 rounded mb-4" 
                                            value={searchCriteria.tag} 
                                            onChange={(e) => {
                                                const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
                                                if (tags.length <= 5) {
                                                    handleCriteriaChange('tag', e.target.value);
                                                }
                                            }} 
                                            placeholder="カンマ区切りで最大5つまで" 
                                        />
                                        {searchCriteria.tag.split(',').filter(tag => tag.trim() !== '').length > 5 && (
                                            <span className="text-red-500 text-sm">タグは最大5つまでです。</span>
                                        )}
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="whitespace-nowrap">アーティスト名:</label>
                                        <input type="text" className="border p-2 rounded mb-4" value={searchCriteria.artist} onChange={(e) => handleCriteriaChange('artist', e.target.value)} />
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="whitespace-nowrap">ジャンル:</label>
                                        <input type="text" className="border p-2 rounded mb-4" value={searchCriteria.genre} onChange={(e) => handleCriteriaChange('genre', e.target.value)} />
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="whitespace-nowrap">熟練度:</label>
                                        <input type="number" className="border p-2 rounded mb-4" value={searchCriteria.skillLevel} onChange={(e) => handleCriteriaChange('skillLevel', parseInt(e.target.value, 10))} />
                                        <div className="flex gap-2 radio02 mb-4">
                                            <input type="radio" id="skillLevelOptionBelow" name="skillLevelOption" value="以下" checked={searchCriteria.skillLevelOption === '以下'} onChange={(e) => handleCriteriaChange('skillLevelOption', e.target.value)} />
                                            <label htmlFor="skillLevelOptionBelow">以下</label>
                                            <input type="radio" id="skillLevelOptionAbove" name="skillLevelOption" value="以上" checked={searchCriteria.skillLevelOption === '以上'} onChange={(e) => handleCriteriaChange('skillLevelOption', e.target.value)} />
                                            <label htmlFor="skillLevelOptionAbove">以上</label>
                                        </div>
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="whitespace-nowrap">備考:</label>
                                        <input type="text" className="border p-2 rounded mb-4" value={searchCriteria.memo} onChange={(e) => handleCriteriaChange('memo', e.target.value)} />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="w-full">
                            <div className="p-4 bg-white shadow rounded-lg">
                                <h3 className="font-bold mb-4">除外</h3>
                                <div className="flex flex-wrap gap-4">
                                    <div className="flex flex-col">
                                        <label className="whitespace-nowrap">除外タグ:</label>
                                        <input 
                                            type="text" 
                                            className="border p-2 rounded mb-4" 
                                            value={searchCriteria.excludedTags} 
                                            onChange={(e) => handleCriteriaChange('excludedTags', e.target.value)} 
                                            placeholder="カンマ区切りでタグを除外"
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="whitespace-nowrap">除外ジャンル:</label>
                                        <input 
                                            type="text" 
                                            className="border p-2 rounded mb-4" 
                                            value={searchCriteria.excludedGenres} 
                                            onChange={(e) => handleCriteriaChange('excludedGenres', e.target.value)} 
                                            placeholder="カンマ区切りでジャンルを除外"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchForm;
