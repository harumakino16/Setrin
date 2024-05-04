import { getAuth, signOut } from 'firebase/auth';
import { useRouter } from 'next/router';

const useLogOut = () => {
    const auth = getAuth();
    const router = useRouter();

    const logOut = async () => {
        try {
            await signOut(auth);
            console.log('ログアウトしました。');
            router.push('/register');
        } catch (error) {
            console.error('ログアウトに失敗しました:', error);
        }
    };

    return logOut;
};

export default useLogOut;
