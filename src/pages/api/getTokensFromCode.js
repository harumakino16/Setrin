// pages/api/refresh_token.js
import fetch from 'node-fetch';
import { youtubeConfig } from '../../../youtubeConfig';
import { initializeApp } from 'firebase/app'; // Added
import { getFirestore } from 'firebase/firestore'; // writeBatch imported
import { firebaseConfig } from '../../../firebaseConfig'; // Added

const app = initializeApp(firebaseConfig); // Added
const db = getFirestore(app); // Firestore instance obtained

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { code } = req.body;

    if (!code) {
        return res.status(400).json({ message: 'Authorization code is required' });
    }

    try {
        const clientId = youtubeConfig.clientId;
        const clientSecret = youtubeConfig.clientSecret;
        const redirectUri = youtubeConfig.redirectUri;
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

        // トークンを返すだけにする
        res.status(200).json({
            accessToken: tokenData.access_token,
            refreshToken: tokenData.refresh_token,
            expiresIn: tokenData.expires_in,
        });
    } catch (error) {
        
        res.status(500).json({ message: error.message });
    }
}
