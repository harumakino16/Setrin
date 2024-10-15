import { google } from 'googleapis';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            const { token, videoUrls, setlistName } = req.body;

            if (!token) {
                return res.status(400).json({ message: 'Access token is required' });
            }

            if (!videoUrls || !Array.isArray(videoUrls) || videoUrls.length === 0) {
                return res.status(400).json({ message: 'Video URLs are required and must be an array' });
            }

            const oauth2Client = new google.auth.OAuth2();
            oauth2Client.setCredentials({ access_token: token });

            const youtube = google.youtube({
                version: 'v3',
                auth: oauth2Client,
            });

            try {
                const playlistResponse = await youtube.playlists.insert({
                    part: ['snippet,status'],
                    requestBody: {
                        snippet: {
                            title: setlistName,
                            description: 'APIを通じて作成されたプレイリスト',
                            defaultLanguage: 'ja',
                        },
                        status: {
                            privacyStatus: 'private', // 非公開の再生リストを作成
                        },
                    },
                });

                const playlistId = playlistResponse.data.id;

                const videoIds = videoUrls.map(url => {
                    const urlObj = new URL(url);
                    if (urlObj.hostname === 'youtu.be') {
                        // 短縮URLの場合、パスからIDを抽出
                        return urlObj.pathname.slice(1); // 先頭のスラッシュを取り除く
                    } else {
                        // 通常のYouTube URLの場合
                        return urlObj.searchParams.get('v');
                    }
                });


                for (const videoId of videoIds) {
                    try {
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
                    } catch (apiError) {
                        if (apiError.errors && apiError.errors[0].reason === 'videoNotFound') {
                            
                            continue; // ビデオが見つからない場合はスキップ
                        } else {
                            throw apiError; // 他のエラーは再スロー
                        }
                    }
                }

                res.status(200).json({ playlistId: playlistId });
            } catch (apiError) {
                if (apiError.code === 401 && apiError.errors[0].reason === 'youtubeSignupRequired') {
                    res.status(401).json({ message: 'YouTubeチャンネルが必要です。チャンネルを作成してください。' });
                    
                } else {
                    throw apiError;
                }
            }
        } catch (error) {
            
            res.status(500).json({ message: error.message });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}

