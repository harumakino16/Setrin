export const convertUrlsToLinks = (text) => {
  if (!text) return '';
  
  // URLを検出する正規表現
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  
  return text.split(urlRegex).map((part, i) => {
    if (part.match(urlRegex)) {
      return `<a href="${part}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline">${part}</a>`;
    }
    return part;
  }).join('');
}; 