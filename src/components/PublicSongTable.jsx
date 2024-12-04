import React, { useState, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { convertKanaToHira } from '../utils/stringUtils';

const PublicSongTable = ({ songs, visibleColumns }) => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  
  const columnLabels = [
    { key: 'title', label: '曲名' },
    { key: 'artist', label: 'アーティスト' },
    { key: 'genre', label: 'ジャンル' },
    { key: 'youtubeUrl', label: 'YouTubeリンク' },
    { key: 'tags', label: 'タグ' },
    { key: 'singingCount', label: '歌唱回数' },
    { key: 'skillLevel', label: '熟練度' }
  ];

  const filteredSongs = songs.filter(song => {
    if (!searchKeyword) return true;
    
    const keyword = searchKeyword.toLowerCase();
    const keywordHira = convertKanaToHira(keyword);
    
    return (
      song.title?.toLowerCase().includes(keyword) ||
      song.artist?.toLowerCase().includes(keyword) ||
      song.genre?.toLowerCase().includes(keyword) ||
      song.tags?.some(tag => tag.toLowerCase().includes(keyword)) ||
      (song.furigana && convertKanaToHira(song.furigana.toLowerCase()).includes(keywordHira))
    );
  });

  const sortedSongs = useMemo(() => {
    let sortableSongs = [...filteredSongs];
    if (sortConfig.key) {
      sortableSongs.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        
        if (sortConfig.key === 'title') {
          aValue = a.furigana || a.title;
          bValue = b.furigana || b.title;
        }
        
        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableSongs;
  }, [filteredSongs, sortConfig]);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  return (
    <div>
      <div className="mb-4">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FontAwesomeIcon icon={faSearch} className="text-gray-500" />
          </span>
          <input
            type="text"
            placeholder="曲名、アーティスト、ジャンル、タグで検索..."
            className="w-full p-4 pl-10 border rounded-lg"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full whitespace-nowrap divide-y divide-gray-200" style={{ tableLayout: 'fixed' }}>
          <colgroup>
            {columnLabels.map(({ key }) => 
              visibleColumns?.[key] && (
                <col key={key} style={{ width: '250px' }} />
              )
            )}
          </colgroup>
          <thead className="bg-gray-50">
            <tr>
              {columnLabels.map(({ key, label }) => 
                visibleColumns?.[key] && (
                  <th
                    key={key}
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    style={{ maxWidth: '250px' }}
                    onClick={() => requestSort(key)}
                  >
                    {label}
                    <span>
                      {sortConfig.key === key ? (
                        sortConfig.direction === 'ascending' ? ' ▲' : ' ▼'
                      ) : ' ⇅'}
                    </span>
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedSongs.map((song, index) => (
              <tr key={song.id || index}>
                {columnLabels.map(({ key }) => 
                  visibleColumns?.[key] && (
                    <td key={key} className="px-6 py-4" style={{ maxWidth: '250px' }}>
                      <div className="truncate">
                        {key === 'youtubeUrl' ? (
                          song.youtubeUrl ? (
                            <a
                              href={song.youtubeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800"
                            >
                              動画を開く
                            </a>
                          ) : (
                            "未登録"
                          )
                        ) : key === 'tags' ? (
                          <div className="flex flex-wrap gap-1">
                            {song[key]?.map((tag, i) => (
                              <span
                                key={i}
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        ) : key === 'skillLevel' ? (
                          song[key]
                        ) : (
                          song[key]
                        )}
                      </div>
                    </td>
                  )
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PublicSongTable;