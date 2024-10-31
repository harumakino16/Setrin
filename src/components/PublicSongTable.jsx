import React from 'react';

const PublicSongTable = ({ songs, visibleColumns }) => {
  // 表示するカラムの定義
  const columnLabels = {
    title: '曲名',
    artist: 'アーティスト',
    genre: 'ジャンル',
    youtube: 'YouTubeリンク',
    tags: 'タグ',
    singingCount: '歌唱回数',
    skillLevel: '熟練度'
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {Object.entries(visibleColumns || {}).map(([key, isVisible]) => 
              isVisible && (
                <th
                  key={key}
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {columnLabels[key]}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {songs.map((song, index) => (
            <tr key={song.id || index}>
              {Object.entries(visibleColumns || {}).map(([key, isVisible]) => 
                isVisible && (
                  <td key={key} className="px-6 py-4 whitespace-nowrap">
                    {key === 'youtube' ? (
                      <a
                        href={song[key]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        動画を開く
                      </a>
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
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-900">
                          {['初心者', '練習中', '習得済み'][song[key] || 0]}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-900">{song[key]}</span>
                    )}
                  </td>
                )
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PublicSongTable; 