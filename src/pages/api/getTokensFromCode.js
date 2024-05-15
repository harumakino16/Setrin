// pages/api/refresh_token.js
import fetch from 'node-fetch';
import { youtubeConfig } from '../../../youtubeConfig';
import { getFirestore, doc, writeBatch } from 'firebase/firestore'; // writeBatch imported

const db = getFirestore(); // Firestore instance obtained

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { code, currentUser } = req.body;

    if (!code) {
        return res.status(400).json({ message: 'Authorization code is required' });
    }

    try {
        const clientId = youtubeConfig.clientId;
        const clientSecret = youtubeConfig.clientSecret;
        const redirectUri = youtubeConfig.redirectUri; // OAuthで使用したリダイレクトURIを指定
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
            console.error('Token response error:', tokenData);
            throw new Error(tokenData.error || 'Failed to fetch tokens');
        }

        // リフレッシュトークンをデータベースに保存
        if (currentUser && tokenData.refresh_token) {
            console.log('Saving refresh token to Firestore');
            const batch = writeBatch(db); // writeBatch used
            const userRef = doc(db, 'users', currentUser.uid);
            batch.update(userRef, { youtubeRefreshToken: tokenData.refresh_token });
            await batch.commit();
            console.log('Refresh token saved successfully');
        }

        res.status(200).json({
            accessToken: tokenData.access_token,
            refreshToken: tokenData.refresh_token,
            expiresIn: tokenData.expires_in,
        });
        console.log('accessToken:', tokenData.access_token);
        console.log('refreshToken:', tokenData.refresh_token);
        console.log('expiresIn:', tokenData.expires_in);
    } catch (error) {
        console.error('トークンの取得に失敗しました:', error);
        res.status(500).json({ message: error.message });
    }
}
