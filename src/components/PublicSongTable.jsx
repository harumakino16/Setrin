// components/PublicSongTable.jsx
import React from 'react';
import { convertUrlsToLinks } from '@/utils/textUtils';

export default function PublicSongTable({ songs, visibleColumns, onRequestSort, sortConfig = { key: 'title', direction: 'ascending' }, extraAction, originalSongs }) {
  const columnLabels = [
    { key: 'title', label: '曲名' },
    { key: 'artist', label: 'アーティスト' },
    { key: 'genre', label: 'ジャンル' },
    { key: 'youtubeUrl', label: 'YouTubeリンク' },
    { key: 'tags', label: 'タグ' },
    { key: 'singingCount', label: '歌唱回数' },
    { key: 'skillLevel', label: '熟練度' },
    { key: 'note', label: '備考' },
    { key: 'memo', label: 'メモ' }
  ];

  const getSortIndicator = (key) => {
    if (!sortConfig || sortConfig.key !== key) {
      return '⇅'; // ソート可能なことを示す
    }
    return sortConfig.direction === 'ascending' ? '▲' : '▼';
  };

  const handleHeaderClick = (key) => {
    if (onRequestSort) {
      onRequestSort(key);
    }
  };

  return (
    <>
      <div className="flex justify-end mb-2 text-sm text-gray-600">
        {originalSongs && originalSongs.length !== songs.length ? (
          <>表示中: {songs.length}曲 / 総曲数: {originalSongs.length}曲</>
        ) : (
          <>総曲数: {songs.length}曲</>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full whitespace-nowrap divide-y divide-gray-200" style={{ tableLayout: 'fixed' }}>
          <colgroup>
            {extraAction && <col style={{ width: '120px' }} />}
            {columnLabels.map(({ key }) =>
              visibleColumns?.[key] && (
                <col key={key} style={{ width: '250px' }} />
              )
            )}
          </colgroup>
          <thead className="bg-gray-50">
            <tr>
              {extraAction && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  リクエスト
                </th>
              )}
              {columnLabels.map(({ key, label }) =>
                visibleColumns?.[key] && (
                  <th
                    key={key}
                    scope="col"
                    className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer
                  ${sortConfig?.key === key ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                    style={{ maxWidth: '250px', userSelect: 'none' }}
                    onClick={() => handleHeaderClick(key)}
                  >
                    <div className="flex items-center space-x-2">
                      <span>{label}</span>
                      <span className="text-sm text-gray-400">{getSortIndicator(key)}</span>
                    </div>
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {songs.map((song, index) => (
              <tr key={song.id || index}>
                {extraAction && (
                  <td className="px-6 py-4">
                    {extraAction(song)}
                  </td>
                )}
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
                        ) : (
                          song[key]
                        )}
                      </div>
                    </td>
                  )
                )}
                {visibleColumns.note?.visible && (
                  <td className="px-6 py-4 whitespace-normal break-words text-sm">
                    <div dangerouslySetInnerHTML={{ 
                      __html: convertUrlsToLinks(song.note) 
                    }} />
                  </td>
                )}
                {visibleColumns.memo?.visible && (
                  <td className="px-6 py-4 whitespace-normal break-words text-sm">
                    <div dangerouslySetInnerHTML={{ 
                      __html: convertUrlsToLinks(song.memo) 
                    }} />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
