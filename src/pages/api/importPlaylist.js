import { google } from 'googleapis';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { playlistUrl, currentUser } = req.body;
        
        try {
            // URLの検証
            if (!playlistUrl) {
                return res.status(400).json({ message: '再生リストURLが必要です' });
            }

            let playlistId;
            try {
                const url = new URL(playlistUrl);
                playlistId = url.searchParams.get('list');
            } catch (error) {
                return res.status(400).json({ message: '無効なURLフォーマットです' });
            }

            if (!playlistId) {
                return res.status(400).json({ message: '無効な再生リストURLです' });
            }

            if (!currentUser || !currentUser.youtubeRefreshToken) {
                return res.status(400).json({ message: '現在のユーザーまたはリフレッシュトークンがありません' });
            }

            // アクセストークンの取得
            try {
                const tokenResponse = await fetch(`${process.env.NEXT_PUBLIC_ORIGIN}/api/refreshAccessToken`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ refreshToken: currentUser.youtubeRefreshToken }),
                });

                if (!tokenResponse.ok) {
                    const errorData = await tokenResponse.json();
                    if (errorData.message.includes('invalid_grant')) {
                        return res.status(401).json({ 
                            message: 'YouTube連携の再認証が必要です。設定画面から再度連携を行ってください。',
                            error: 'invalid_grant'
                        });
                    }
                    throw new Error(errorData.message || 'アクセストークンの更新に失敗しました');
                }

                const { accessToken } = await tokenResponse.json();

                const oauth2Client = new google.auth.OAuth2();
                oauth2Client.setCredentials({ access_token: accessToken });

                const youtube = google.youtube({
                    version: 'v3',
                    auth: oauth2Client,
                });

                // 再生リストの取得を試行
                try {
                    const response = await youtube.playlistItems.list({
                        part: 'snippet',
                        playlistId: playlistId,
                        maxResults: 50,
                    });

                    if (!response.data || !response.data.items) {
                        throw new Error('再生リストの取得に失敗しました');
                    }

                    let nextPageToken = response.data.nextPageToken;
                    let allItems = response.data.items;

                    // 追加ページの取得
                    while (nextPageToken) {
                        const nextResponse = await youtube.playlistItems.list({
                            part: 'snippet',
                            playlistId: playlistId,
                            maxResults: 50,
                            pageToken: nextPageToken,
                        });
                        
                        if (!nextResponse.data || !nextResponse.data.items) {
                            break;
                        }
                        
                        allItems = allItems.concat(nextResponse.data.items);
                        nextPageToken = nextResponse.data.nextPageToken;
                    }

                    if (!allItems || allItems.length === 0) {
                        return res.status(404).json({ message: '再生リストにアイテムが見つかりませんでした' });
                    }

                    const songs = allItems.map(item => ({
                        title: item.snippet.title || '不明な曲名',
                        artist: item.snippet.videoOwnerChannelTitle || '不明なアーティスト',
                        youtubeUrl: `https://www.youtube.com/watch?v=${item.snippet.resourceId.videoId}`,
                        tags: "",
                        genre: '',
                        singingCount: 0,
                        skillLevel: 0,
                    }));

                    return res.status(200).json({ 
                        message: '再生リストのインポートに成功しました', 
                        items: songs 
                    });

                } catch (youtubeError) {
                    console.error('YouTube API エラー:', youtubeError);
                    throw new Error(`YouTube APIエラー: ${youtubeError.message}`);
                }

            } catch (error) {
                console.error('トークン更新エラー:', error);
                if (error.message.includes('invalid_grant')) {
                    return res.status(401).json({ 
                        message: 'YouTube連携の再認証が必要です。設定画面から再度連携を行ってください。',
                        error: 'invalid_grant'
                    });
                }
                throw error;
            }

        } catch (error) {
            console.error('インポートエラー:', error);
            return res.status(500).json({ 
                message: '再生リストのインポートに失敗しました', 
                error: error.message 
            });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
