import { google } from 'googleapis';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { playlistUrl, currentUser } = req.body;
        const playlistId = new URL(playlistUrl).searchParams.get('list');

        if (!playlistId) {
            return res.status(400).json({ message: 'Invalid playlist URL' });
        }

        if (!currentUser || !currentUser.youtubeRefreshToken) {
            return res.status(400).json({ message: 'Current user or refresh token is missing' });
        }

        try {
            // 新しいアクセストークンを取得
            const tokenResponse = await fetch(`${process.env.NEXT_PUBLIC_ORIGIN}/api/refreshAccessToken`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ refreshToken: currentUser.youtubeRefreshToken }),
            });

            if (!tokenResponse.ok) {
                throw new Error('Failed to refresh access token');
            }

            const { accessToken } = await tokenResponse.json();

            const oauth2Client = new google.auth.OAuth2();
            oauth2Client.setCredentials({ access_token: accessToken });

            const youtube = google.youtube({
                version: 'v3',
                auth: oauth2Client,
            });

            const response = await youtube.playlistItems.list({
                part: 'snippet',
                playlistId: playlistId,
                maxResults: 50,
            });

            if (!response.data.items) {
                throw new Error('No items found in the playlist');
            }

            const songs = response.data.items.map(item => ({
                title: item.snippet.title,
                artist: item.snippet.videoOwnerChannelTitle,
                youtubeUrl: `https://www.youtube.com/watch?v=${item.snippet.resourceId.videoId}`,
                tags: "",
                genre: '',
                timesSung: 0,
                skillLevel: 0,
                memo: '',
            }));

            res.status(200).json({ message: 'Playlist imported successfully', items: songs });
        } catch (error) {
            console.error('Error importing playlist:', error);
            res.status(500).json({ message: 'Failed to import playlist', error: error.message });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}