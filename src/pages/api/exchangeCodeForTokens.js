export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { code } = req.body;

    if (!code) {
        return res.status(400).json({ message: 'Authorization code is required' });
    }

    try {
        const response = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                code: code,
                client_id: process.env.NEXT_PUBLIC_GOOGLE_CLOUD_CLIENT_ID,
                client_secret: process.env.GOOGLE_CLOUD_CLIENT_SECRET,
                redirect_uri: process.env.NEXT_PUBLIC_REDIRECT_URI,
                grant_type: 'authorization_code',
            }).toString()
        });

        const tokenData = await response.json();

        if (!response.ok) {
            throw new Error(tokenData.error || 'Failed to fetch tokens');
        }

        res.status(200).json({
            accessToken: tokenData.access_token,
            refreshToken: tokenData.refresh_token,
            expiresIn: tokenData.expires_in,
        });
    } catch (error) {
        
        res.status(500).json({ message: error.message });
    }
}
