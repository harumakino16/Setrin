export const youtubeConfig = {
    origin: process.env.NEXT_PUBLIC_ORIGIN,
    scope: "https://www.googleapis.com/auth/youtube",
    redirectUri: process.env.NEXT_PUBLIC_REDIRECT_URI,
    youtubeApiKey: process.env.YOUTUBE_APIKEY,
    clientId: process.env.NEXT_PUBLIC_GOOGLE_CLOUD_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLOUD_CLIENT_SECRET,
};

