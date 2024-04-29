import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';
import { getAuth, signOut } from 'firebase/auth';
import { Router, useNavigate } from 'react-router-dom';

export const useLogOut = () => {
    const auth = getAuth();
    console.log(auth);
    const router = useRouter();

    const logOut = async () => {
        try {
            await signOut(auth);
            console.log('ログアウトしました。');
            router.push('/SigninAndSignupForm');
        } catch (error) {
            console.error('ログアウトに失敗しました:', error);
        }
    };

    logOut();

    return logOut;
};
