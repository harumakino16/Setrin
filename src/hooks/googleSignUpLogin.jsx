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

    const handleGoogleSignUpLogin = async () => {
        const auth = getAuth();
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            const userRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userRef);

            if (!userDoc.exists()) {
                // 新規ユーザーの場合
                await registerUserInFirestore(user);
                setMessageInfo({ message: 'アカウントが作成されました', type: 'success' });
            } else {
                // 既存ユーザーの場合
                setCurrentUser(user);
                setMessageInfo({ message: 'ログインしました', type: 'success' });
            }

            router.push('/');
        } catch (error) {
            
            setMessageInfo({ message: 'Googleログインに失敗しました', type: 'error' });
        }
    };

    return { handleGoogleSignUpLogin };
};

export default useGoogleSignUpLogin;
