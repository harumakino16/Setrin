import { google } from 'googleapis';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            const { token, videoUrls, setlistName } = req.body;

            if (!token) {
                return res.status(400).json({ message: 'アクセストークンが必要です。(YouTube連携が必要です)' });
            }

            if (!videoUrls || !Array.isArray(videoUrls) || videoUrls.length === 0) {
                return res.status(400).json({ message: '動画URLは必須です。' });
            }

            if (videoUrls.length > 5000) {
                return res.status(400).json({ message: '再生リストの最大動画数（5000）を超えています' });
            }

            const oauth2Client = new google.auth.OAuth2();
            oauth2Client.setCredentials({ access_token: token });

            const youtube = google.youtube({
                version: 'v3',
                auth: oauth2Client,
            });

            try {
                let errorVideos = [];
                const videoIds = videoUrls.map(url => {
                    const urlObj = new URL(url);
                    if (urlObj.hostname === 'youtu.be') {
                        return urlObj.pathname.slice(1);
                    } else {
                        return urlObj.searchParams.get('v');
                    }
                });

                // まず、すべての動画をチェック
                for (let i = 0; i < videoIds.length; i++) {
                    try {
                        const videoResponse = await youtube.videos.list({
                            part: 'snippet',
                            id: videoIds[i]
                        });
                        if (videoResponse.data.items.length === 0) {
                            errorVideos.push({ index: i + 1, videoId: videoIds[i] });
                        }
                    } catch (apiError) {
                        errorVideos.push({ index: i + 1, videoId: videoIds[i] });
                    }
                }

                // エラーがある場合は、プレイリストを作成せずにエラーを返す
                if (errorVideos.length > 0) {
                    const errorMessage = `以下の動画が見つからないか非公開のため、再生リストの作成を中止しました：\n${errorVideos.map(v => `${v.index}番目の動画 (ID: ${v.videoId})`).join('\n')}`;
                    return res.status(400).json({ message: errorMessage });
                }

                // エラーがない場合のみ、プレイリストを作成
                const playlistResponse = await youtube.playlists.insert({
                    part: ['snippet,status'],
                    requestBody: {
                        snippet: {
                            title: setlistName,
                            description: 'APIを通じて作成された再生リスト',
                            defaultLanguage: 'ja',
                        },
                        status: {
                            privacyStatus: 'private',
                        },
                    },
                });

                const playlistId = playlistResponse.data.id;

                // 動画をプレイリストに追加
                for (const videoId of videoIds) {
                    await youtube.playlistItems.insert({
                        part: ['snippet'],
                        requestBody: {
                            snippet: {
                                playlistId: playlistId,
                                resourceId: {
                                    kind: 'youtube#video',
                                    videoId: videoId,
                                },
                            },
                        },
                    });
                }

                res.status(200).json({ playlistId: playlistId });
            } catch (apiError) {
                if (apiError.code === 401 && apiError.errors[0].reason === 'youtubeSignupRequired') {
                    res.status(401).json({ message: 'YouTubeチャンネルが必要です。チャンネルを作成してください。' });
                } else if (apiError.code === 403 && apiError.errors[0].reason === 'accountTerminated') {
                    res.status(403).json({ message: 'YouTubeアカウントが停止または削除されています。' });
                } else {
                    res.status(500).json({ message: apiError.message });
                }
            }
        } catch (error) {
            if (error.message.includes('以下の動画が見つからないか非公開のため')) {
                res.status(400).json({ message: error.message });
            } else {
                res.status(500).json({ message: error.message });
            }
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
