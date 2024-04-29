export const Keys = {
    YOUTUBE_APIKEY: "AIzaSyAKect3kaKM3I2jp7sx-XTCCu4U0KiA5PQ",
    CLIENT_ID: "649488417421-hmt9gu6poe3ha32kh8vsffg83ohdomjp.apps.googleusercontent.com",
    CLIENT_SECRET: "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",
    REDIRECT_URI: 'http://localhost:3000/setting',
    ORIGIN: 'http://localhost:3000',
    SCOPE: 'https://www.googleapis.com/auth/youtube',
    
    
} 

export const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${Keys.CLIENT_ID}&redirect_uri=${Keys.REDIRECT_URI}&scope=${Keys.SCOPE}&response_type=code&prompt=consent&access_type=offline`;


