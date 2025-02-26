// SearchForm.jsx
import { useState, useEffect } from 'react';
import { GoChevronDown, GoChevronUp } from 'react-icons/go'; // ReactIconのインポート
import { useSongs } from '../context/SongsContext';
import { convertKanaToHira, convertHiraToKana } from '../utils/stringUtils';
import { useTranslation } from 'next-i18next'; // 翻訳フックをインポート

const SearchForm = ({ currentUser, handleSearchResults, searchCriteria, setSearchCriteria, isRandomSetlist }) => {
    const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
    const { songs } = useSongs();
    const { t } = useTranslation('common'); // 翻訳フックを初期化

    const searchSongs = async (searchCriteria) => {
        let songsData = songs;

        if (searchCriteria.freeKeyword) {
            const keywordLower = searchCriteria.freeKeyword.toLowerCase();
            const keywordHira = convertKanaToHira(keywordLower);
            songsData = songsData.filter(song =>
                (song.title && typeof song.title === 'string' && song.title.toLowerCase().includes(keywordLower)) ||
                (song.artist && typeof song.artist === 'string' && song.artist.toLowerCase().includes(keywordLower)) ||
                (song.tags && Array.isArray(song.tags) && song.tags.some(tag => typeof tag === 'string' && tag.toLowerCase().includes(keywordLower))) ||
                (song.genre && typeof song.genre === 'string' && song.genre.toLowerCase().includes(keywordLower)) ||
                (song.skillLevel && song.skillLevel.toString().toLowerCase().includes(keywordLower)) ||
                (song.memo && String(song.memo).toLowerCase().includes(keywordLower)) ||
                (song.note && String(song.note).toLowerCase().includes(keywordLower)) ||
                (song.furigana && typeof song.furigana === 'string' && convertKanaToHira(song.furigana.toLowerCase()).includes(keywordHira))
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
            songsData = songsData.filter(song => song.tags && song.tags.map(tag => tag.toLowerCase()).includes(tagLower));
        }

        if (searchCriteria.artist) {
            const artistLower = searchCriteria.artist.toLowerCase();
            songsData = songsData.filter(song => 
                song.artist && typeof song.artist === 'string' && song.artist.toLowerCase().includes(artistLower)
            );
        }

        if (searchCriteria.genre) {
            const genreLower = searchCriteria.genre.toLowerCase();
            songsData = songsData.filter(song => 
                song.genre && typeof song.genre === 'string' && song.genre.toLowerCase().includes(genreLower)
            );
        }

        if (searchCriteria.skillLevel > 0) {
            if (searchCriteria.skillLevelOption === '以上') {
                songsData = songsData.filter(song => song.skillLevel && song.skillLevel >= searchCriteria.skillLevel);
            } else {
                songsData = songsData.filter(song => song.skillLevel && song.skillLevel <= searchCriteria.skillLevel);
            }
        }

        if (searchCriteria.memo) {
            const memoLower = searchCriteria.memo.toLowerCase();
            songsData = songsData.filter(song => 
                song.memo && String(song.memo).toLowerCase().includes(memoLower)
            );
        }

        if (searchCriteria.note) {
            const noteLower = searchCriteria.note.toLowerCase();
            songsData = songsData.filter(song => 
                song.note && String(song.note).toLowerCase().includes(noteLower)
            );
        }

        if (searchCriteria.excludedTags) {
            const excludedTags = searchCriteria.excludedTags.split(',').map(tag => tag.trim().toLowerCase());
            songsData = songsData.filter(song => 
                !song.tags || !song.tags.some(tag => excludedTags.includes(tag.toLowerCase()))
            );
        }

        if (searchCriteria.excludedGenres) {
            const excludedGenres = searchCriteria.excludedGenres.split(',').map(genre => genre.trim().toLowerCase());
            songsData = songsData.filter(song => 
                !song.genre || !excludedGenres.includes(song.genre.toLowerCase())
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
                    <label className="whitespace-nowrap">{t('freeKeyword')}:</label>
                    <input 
                        type="text" 
                        className="border p-2 rounded w-full h-14" 
                        placeholder={t('searchByKeyword')} 
                        value={searchCriteria.freeKeyword || ''}
                        onChange={(e) => handleCriteriaChange('freeKeyword', e.target.value)}
                    />
                </div>
                <div onClick={() => setShowAdvancedSearch(!showAdvancedSearch)} className="text-gray-500 py-2 px-4 cursor-pointer flex items-center">
                    <span className="text-gray-500">{isRandomSetlist ? t('filter') : t('advancedSearch')}</span> 
                    <span className="text-gray-500">
                        {showAdvancedSearch ? <GoChevronUp size={20} /> : <GoChevronDown size={20} />}
                    </span>
                </div>
                {showAdvancedSearch && (
                    <div className="flex flex-wrap gap-8">
                        <div className="w-full">
                            <div className="p-4 bg-white shadow rounded-lg">
                                <h3 className="font-bold mb-4">{t('filter')}</h3>
                                <div className="flex flex-wrap gap-4">
                                    <div className="flex flex-col">
                                        <label className="whitespace-nowrap">{t('singingCount')}:</label>
                                        <input type="number" className="border p-2 rounded mb-4" value={searchCriteria.maxSung} onChange={(e) => handleCriteriaChange('maxSung', parseInt(e.target.value, 10))} />
                                        <div className="flex gap-2 radio02 mb-4">
                                            <input type="radio" id="maxSungOptionBelow" name="maxSungOption" value="以下" checked={searchCriteria.maxSungOption === '以下'} onChange={(e) => handleCriteriaChange('maxSungOption', e.target.value)} />
                                            <label htmlFor="maxSungOptionBelow">{t('orLess')}</label>
                                            <input type="radio" id="maxSungOptionAbove" name="maxSungOption" value="以上" checked={searchCriteria.maxSungOption === '以上'} onChange={(e) => handleCriteriaChange('maxSungOption', e.target.value)} />
                                            <label htmlFor="maxSungOptionAbove">{t('orMore')}</label>
                                        </div>
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="whitespace-nowrap">{t('tag')}:</label>
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
                                            placeholder={t('commaSeparatedMaxFiveTags')} 
                                        />
                                        {searchCriteria.tag.split(',').filter(tag => tag.trim() !== '').length > 5 && (
                                            <span className="text-red-500 text-sm">{t('maxFiveTags')}</span>
                                        )}
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="whitespace-nowrap">{t('artist')}:</label>
                                        <input type="text" className="border p-2 rounded mb-4" value={searchCriteria.artist} onChange={(e) => handleCriteriaChange('artist', e.target.value)} />
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="whitespace-nowrap">{t('genre')}:</label>
                                        <input type="text" className="border p-2 rounded mb-4" value={searchCriteria.genre} onChange={(e) => handleCriteriaChange('genre', e.target.value)} />
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="whitespace-nowrap">{t('skillLevel')}:</label>
                                        <input type="number" className="border p-2 rounded mb-4" value={searchCriteria.skillLevel} onChange={(e) => handleCriteriaChange('skillLevel', parseInt(e.target.value, 10))} />
                                        <div className="flex gap-2 radio02 mb-4">
                                            <input type="radio" id="skillLevelOptionBelow" name="skillLevelOption" value="以下" checked={searchCriteria.skillLevelOption === '以下'} onChange={(e) => handleCriteriaChange('skillLevelOption', e.target.value)} />
                                            <label htmlFor="skillLevelOptionBelow">{t('orLess')}</label>
                                            <input type="radio" id="skillLevelOptionAbove" name="skillLevelOption" value="以上" checked={searchCriteria.skillLevelOption === '以上'} onChange={(e) => handleCriteriaChange('skillLevelOption', e.target.value)} />
                                            <label htmlFor="skillLevelOptionAbove">{t('orMore')}</label>
                                        </div>
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="whitespace-nowrap">{t('note')}:</label>
                                        <input 
                                            type="text" 
                                            className="border p-2 rounded mb-4" 
                                            value={searchCriteria.note} 
                                            onChange={(e) => handleCriteriaChange('note', e.target.value)} 
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="whitespace-nowrap">{t('memo')}:</label>
                                        <input 
                                            type="text" 
                                            className="border p-2 rounded mb-4" 
                                            value={searchCriteria.memo} 
                                            onChange={(e) => handleCriteriaChange('memo', e.target.value)} 
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="w-full">
                            <div className="p-4 bg-white shadow rounded-lg">
                                <h3 className="font-bold mb-4">{t('exclude')}</h3>
                                <div className="flex flex-wrap gap-4">
                                    <div className="flex flex-col">
                                        <label className="whitespace-nowrap">{t('excludeTags')}:</label>
                                        <input 
                                            type="text" 
                                            className="border p-2 rounded mb-4" 
                                            value={searchCriteria.excludedTags} 
                                            onChange={(e) => handleCriteriaChange('excludedTags', e.target.value)} 
                                            placeholder={t('commaSeparatedExcludeTags')}
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="whitespace-nowrap">{t('excludeGenres')}:</label>
                                        <input 
                                            type="text" 
                                            className="border p-2 rounded mb-4" 
                                            value={searchCriteria.excludedGenres} 
                                            onChange={(e) => handleCriteriaChange('excludedGenres', e.target.value)} 
                                            placeholder={t('commaSeparatedExcludeGenres')}
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
