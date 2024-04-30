export const youtubeConfig = {
    origin: "http://localhost:3000",
    scope: "https://www.googleapis.com/auth/youtube",
    redirectUri: "http://localhost:3000/setting",
    youtubeApiKey: process.env.YOUTUBE_APIKEY,
    clientId: process.env.NEXT_PUBLIC_CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
};