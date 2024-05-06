import { getAuth, signOut } from 'firebase/auth';
import { useRouter } from 'next/router';
import { useMessage } from '../context/MessageContext';

const useLogOut = () => {
    const router = useRouter();
    const { setMessageInfo } = useMessage();
    const auth = getAuth(); 

    const logOut = async () => {
        try {
            await signOut(auth);
            console.log('ログアウトしました。');
            setMessageInfo({ message: 'ログアウトしました。', type: 'info' });
            router.push('/register');
        } catch (error) {
            console.error('ログアウトに失敗しました:', error);
            setMessageInfo({ message: 'ログアウトに失敗しました: ' + error.message, type: 'error' });
        }
    };

    return logOut;
};

export default useLogOut;
