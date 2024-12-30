import { saveAs } from 'file-saver';
import { CSV_HEADERS } from '../constants/csvHeaders'; // ヘッダー情報をインポート

export const exportToCSV = (data) => {
  const csvRows = [];
  csvRows.push(CSV_HEADERS.join(','));

  data.forEach(song => {
    const values = [
      song.title || '',
      song.furigana || '',
      song.artist || '',
      song.genre || '',
      (song.tags && song.tags[0]) || '',
      (song.tags && song.tags[1]) || '',
      (song.tags && song.tags[2]) || '',
      (song.tags && song.tags[3]) || '',
      (song.tags && song.tags[4]) || '',
      song.youtubeUrl || '',
      song.singingCount || 0,
      song.skillLevel || 0,
      song.note || '',
      song.memo || ''
    ].map(value => {
      const escaped = ('' + value).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  });

  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });

  const date = new Date();
  const formattedDate = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
  const filename = `Setlink_曲リスト_${formattedDate}.csv`;

  saveAs(blob, filename);
}; 