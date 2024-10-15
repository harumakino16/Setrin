import { useRouter } from 'next/router';
import { getAuth, signInWithCredential, GoogleAuthProvider } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import { useEffect } from 'react';

const CallbackPage = () => {
    const router = useRouter();

    useEffect(() => {
        const handleCallback = async () => {
            const { code } = router.query;

            if (code) {
                try {
                    
                    const auth = getAuth();
                    const credential = GoogleAuthProvider.credentialFromResult(result);
                    const userCredential = await signInWithCredential(auth, credential);
                    const user = userCredential.user;

                    // リフレッシュトークンの取得
                    const tokenResult = await user.getIdTokenResult(true);
                    const refreshToken = tokenResult.refreshToken;
                    
                    // Firestoreにリフレッシュトークンを保存
                    await updateDoc(doc(db, 'users', user.uid), { refreshToken });

                    // ログイン後のページにリダイレクト
                    // router.push('/'); // ログイン後のページに適宜変更
                } catch (error) {
                    
                    // エラーハンドリング
                }
            }
        };

        handleCallback();
    }, [router.query]);

    return <div>認証中です...</div>; // ローディング表示など
};

export default CallbackPage;
