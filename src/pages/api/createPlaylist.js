import { google } from 'googleapis';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            const { token } = req.body;

            if (!token) {
                return res.status(400).json({ message: 'Access token is required' });
            }

            const oauth2Client = new google.auth.OAuth2();
            oauth2Client.setCredentials({ access_token: token });

            const youtube = google.youtube({
                version: 'v3',
                auth: oauth2Client,
            });

            try {
                const response = await youtube.playlists.insert({
                    part: ['snippet,status'],
                    requestBody: {
                        snippet: {
                            title: '新しいプレイリスト',
                            description: 'APIを通じて作成されたプレイリスト',
                            defaultLanguage: 'ja',
                        },
                        status: {
                            privacyStatus: 'public',
                        },
                    },
                });
                res.status(200).json(response.data);
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
