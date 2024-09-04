import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, writeBatch, serverTimestamp } from 'firebase/firestore';
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

    const handleGoogleSignUpLogin = async (isSignUp) => {
        const auth = getAuth();
        console.log("auth",auth);
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            if (isSignUp) {
                // 新規アカウント作成の場合
                const batch = writeBatch(db);
                const userRef = doc(db, 'users', user.uid);
                batch.set(userRef, {
                    email: user.email,
                    createdAt: serverTimestamp(),
                    displayName: user.displayName,
                    // refreshToken: refreshToken
                });
                await batch.commit();

                await registerUserInFirestore(user);
                setMessageInfo({ message: 'アカウントが作成されました', type: 'success' });
            } else {
                // 通常ログインの場合
                setCurrentUser(user);
                setMessageInfo({ message: 'ログインしました', type: 'success' });
            }

            router.push('/');
        } catch (error) {
            console.error("Googleサインインエラー:", error);
            setMessageInfo({ message: 'Googleログインに失敗しました', type: 'error' });
        }
    };

    return { handleGoogleSignUpLogin };
};

export default useGoogleSignUpLogin;
