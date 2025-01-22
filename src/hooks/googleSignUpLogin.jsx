import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, writeBatch, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { registerUserInFirestore } from '@/utils/firebaseUtils';
import { useMessage } from '@/context/MessageContext';
import { useRouter } from 'next/router';
import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';

const useGoogleSignUpLogin = () => {
    const { setCurrentUser } = useContext(AuthContext);
    const { setMessageInfo } = useMessage();
    const router = useRouter();

    // UTMパラメータを取得する関数
    const getUtmParams = () => {
        const utmSource = router.query.utm_source;
        const utmMedium = router.query.utm_medium;
        const utmCampaign = router.query.utm_campaign;

        return {
            utmSource,
            utmMedium,
            utmCampaign
        };
    };

    // リファラー情報を取得する関数
    const getReferrer = () => {
        if (typeof document !== 'undefined') {
            return document.referrer || 'direct';
        }
        return 'direct';
    };

    // サインアップソースを判定する関数
    const determineSignUpSource = () => {
        const { utmSource, utmMedium } = getUtmParams();
        const referrer = getReferrer();

        // UTMパラメータがある場合はそれを優先
        if (utmSource) {
            if (utmSource.includes('ad') || utmMedium === 'cpc') {
                return 'ad';
            }
            return utmSource;
        }

        // リファラーに基づいて判定
        if (referrer.includes('google')) {
            return 'google_organic';
        } else if (referrer.includes('twitter')) {
            return 'twitter';
        } else if (referrer.includes('facebook')) {
            return 'facebook';
        }

        return 'direct';
    };

    const handleGoogleSignUpLogin = async () => {
        const auth = getAuth();
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            const userRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userRef);

            // サインアップソースを取得
            const signUpSource = determineSignUpSource();

            if (!userDoc.exists()) {
                // 新規ユーザーの場合
                await registerUserInFirestore({
                    ...user,
                    signUpSource: signUpSource,
                    createdAt: serverTimestamp(),
                    lastActivityAt: serverTimestamp()
                });
                setMessageInfo({ message: 'アカウントが作成されました', type: 'success' });
            } else {
                // 既存ユーザーの場合
                setCurrentUser(user);
                setMessageInfo({ message: 'ログインしました', type: 'success' });
            }

            router.push('/');
        } catch (error) {
            console.error('Google login error:', error);
            setMessageInfo({ message: 'Googleログインに失敗しました', type: 'error' });
        }
    };

    return { handleGoogleSignUpLogin };
};

export default useGoogleSignUpLogin;
