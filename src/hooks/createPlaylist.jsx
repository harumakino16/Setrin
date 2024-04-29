import axios from 'axios';

export const createPlaylist = async () => {
  try {
    const response = await axios.post(
      'https://www.googleapis.com/youtube/v3/playlists',
      {
        snippet: {
          title: '新しいプレイリスト',
          description: 'プログラムによって作成されたプレイリストです。',
        },
        status: {
          privacyStatus: 'private',  // 'public', 'unlisted', 'private' から選択可能
        }
      },
      {
        headers: {
          Authorization: `Bearer ya29.a0Ad52N3-Za9fSH4g7FPnThC9v-i62B0cAqkDzl_ZZKgsa-IcoxNCpC7PV0gxX9VQ-6YtLj7-fx3w4Yhfo31SRbXHVOmkwhtrmJ0GL6YZLC2wlN9A8-mrwAMlOo2UruPvqmVXKe-1UoY_oSNo8Q8Y5329M2CeHDaGNegaCgYKAbMSARESFQHGX2MiA8zAB28_2sN1i5gRjQ8-8Q0169`,
          'Content-Type': 'application/json',
        },
      }
    );
    console.log('プレイリストを作成しました:', response.data);
  } catch (error) {
    console.error('失敗しました:', error);
  }
};
