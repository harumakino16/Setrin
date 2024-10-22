export const formatSongData = (song, isNewSong = false) => {
    if (!song.title || song.title.trim() === '') {
        throw new Error('曲名は必須です。');
    }

    const tags = song.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');

    if (tags.length > 3) {
        throw new Error('タグは3つまでです。');
    }

    const youtubeUrlPattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
    if (song.youtubeUrl && !youtubeUrlPattern.test(song.youtubeUrl)) {
        throw new Error('無効なYouTube URLです。');
    }

    return {
        title: song.title,
        artist: song.artist || '未設定',
        tags: tags,
        genre: song.genre,
        youtubeUrl: song.youtubeUrl,
        singingCount: parseInt(song.singingCount, 10) || 0,
        skillLevel: parseInt(song.skillLevel, 10) || 0,
        memo: song.memo || '',
        furigana: song.furigana != null ? song.furigana : song.title,
        createdAt: isNewSong ? new Date() : song.createdAt,
        updatedAt: new Date(),
    };
};
