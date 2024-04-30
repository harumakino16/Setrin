export const youtubeConfig = {
    origin: process.env.NEXT_PUBLIC_ORIGIN,
    scope: "https://www.googleapis.com/auth/youtube",
    redirectUri: process.env.NEXT_PUBLIC_REDIRECT_URI,
    youtubeApiKey: process.env.YOUTUBE_APIKEY,
    clientId: process.env.NEXT_PUBLIC_CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
};