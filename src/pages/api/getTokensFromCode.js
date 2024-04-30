// pages/api/refresh_token.js
import fetch from 'node-fetch';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { code } = req.body;

    if (!code) {
        return res.status(400).json({ message: 'Authorization code is required' });
    }

    try {
        const clientId = process.env.NEXT_PUBLIC_CLIENT_ID;
        const clientSecret = process.env.CLIENT_SECRET;
        const redirectUri = process.env.NEXT_PUBLIC_REDIRECT_URI; // OAuthで使用したリダイレクトURIを指定
        const tokenUrl = 'https://www.googleapis.com/oauth2/v4/token';


        const tokenResponse = await fetch(tokenUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                code: code,
                client_id: clientId,
                client_secret: clientSecret,
                redirect_uri: redirectUri,
                grant_type: 'authorization_code',
            }).toString()
        });

        const tokenData = await tokenResponse.json();

        if (!tokenResponse.ok) {
            throw new Error(tokenData.error || 'Failed to fetch tokens');
        }

        res.status(200).json({
            accessToken: tokenData.access_token,
            refreshToken: tokenData.refresh_token,
            expiresIn: tokenData.expires_in,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
        console.error('', error);
    }
}
