import fetch from 'node-fetch';
import { youtubeConfig } from '../../../youtubeConfig';


export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { refreshToken } = req.body;

    if (!refreshToken) {
        
        return res.status(400).json({ message: 'Refresh token is required' });
    }
    
    try {
        
        const clientId = youtubeConfig.clientId;       // 環境変数からクライアントIDを取得
        const clientSecret = youtubeConfig.clientSecret; // 環境変数からクライアントシークレットを取得
        const tokenUrl = 'https://www.googleapis.com/oauth2/v4/token';

        const tokenResponse = await fetch(tokenUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: refreshToken,
                client_id: clientId,
                client_secret: clientSecret,
            }).toString()
        });
        const requestBody = new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
            client_id: clientId,
            client_secret: clientSecret,
        }).toString();
        
        
        
        

        const tokenData = await tokenResponse.json();

        if (!tokenResponse.ok) {
            throw new Error(tokenData.error || 'Failed to refresh access token');
        }

        res.status(200).json({
            accessToken: tokenData.access_token,
            expiresIn: tokenData.expires_in,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
        
        
    }
}
