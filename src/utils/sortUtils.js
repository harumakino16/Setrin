export const sortSongs = (songs, sortConfig) => {
  return [...songs].sort((a, b) => {
    if (sortConfig.key === 'title') {
      const aValue = a.furigana || a.title;
      const bValue = b.furigana || b.title;
      if (aValue < bValue) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    } else {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    }
  });
}; 