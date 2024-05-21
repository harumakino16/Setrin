import React, { useState, useContext, useEffect } from 'react';
import { FcGoogle } from "react-icons/fc";
import { MdEmail } from "react-icons/md";
import Link from 'next/link';
import { getAuth, signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { AuthContext } from '@/context/AuthContext';
import { useRouter } from 'next/router';
import { useMessage } from '@/context/MessageContext';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { currentUser, setCurrentUser } = useContext(AuthContext);
    const router = useRouter();
    const [errorMessage, setErrorMessage] = useState('');
    const { setMessageInfo } = useMessage();

    useEffect(() => {
        if (currentUser) {
            router.push('/');
        }
    }, [currentUser, router]);

    const validateEmail = (email) => {
        return String(email)
            .toLowerCase()
            .match(
                /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            );
    };

    const validatePassword = (password) => {
        return password.length >= 6;
    };

    const isFormValid = () => {
        return validateEmail(email) && validatePassword(password);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const auth = getAuth();
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            if (userCredential.user.emailVerified) {
                setCurrentUser(userCredential.user);
                setMessageInfo('ログインに成功しました。', 'success');
                router.push('/');
            } else {
                setErrorMessage('メールアドレスは登録されていますが、認証が完了していません。認証メールを再送します。');
                await sendEmailVerification(userCredential.user);
                setMessageInfo('認証メールを再送しました。', 'info');

            }
        } catch (error) {
            console.error("ログインエラー:", error);
            setErrorMessage('ログインに失敗しました。');
            setMessageInfo('ログインに失敗しました。', 'error');
        }
    };

    const handleGoogleLogin = async () => {
        const auth = getAuth();
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            setCurrentUser(result.user);
            router.push('/');
        } catch (error) {
            console.error("Googleログインエラー:", error);
            setErrorMessage('Googleログインに失敗しました。');
            setMessageInfo('Googleログインに失敗しました。', 'error');
        }
    };

    return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
            <div className=" w-[600px] mx-auto p-10 pb-5 bg-white rounded-lg">
                <h1 className="text-xl font-bold mb-4 text-center">ログイン</h1>
                {errorMessage && <p className="text-red-500 text-center">{errorMessage}</p>}
                <form onSubmit={handleSubmit} className="space-y-4 ">
                    <div>
                        <label htmlFor="email" className="block text-lg font-medium text-gray-700">メールアドレス</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="taro.yamada@example.com"
                            className="mt-1 block w-full px-3 h-12 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-lg font-medium text-gray-700">パスワード</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="パスワード"
                            className="mt-1 block w-full px-3 h-12 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    <button type="submit" disabled={!isFormValid()} className={`w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${isFormValid() ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' : 'bg-gray-400'} focus:outline-none focus:ring-2 focus:ring-offset-2 gap-3`}>
                        <MdEmail size={24} />
                        <span>メールアドレスでログイン</span>
                    </button>
                </form>
                <div className="flex items-center justify-center my-6">
                    <hr className="flex-grow" />
                    <div className="text-center text-gray-500 mx-4 text-sm">または</div>
                    <hr className="flex-grow" />
                </div>
                <div className="flex flex-col space-y-4 mb-5">
                    <button onClick={handleGoogleLogin} className="bg-white hover:bg-gray-100 text-gray-700 font-semibold py-4 px-4 border border-gray-200 rounded w-full">
                        <div className="flex items-center justify-start space-x-2">
                            <FcGoogle size={24} />
                            <span className="flex-grow text-center">Googleでログイン</span>
                        </div>
                    </button>
                </div>
                <div className="flex flex-col space-y-1 mb-5">
                    <p className="text-center text-gray-500 text-sm">パスワードを忘れた方はこちら</p>
                    <p className="text-center text-gray-500 text-sm">ログインできない方はこちら</p>
                </div>
                <div className='text-center'>
                    <Link href="/register" className="text-blue-500 font-bold">会員登録はこちら</Link>
                </div>
            </div>
        </div>
    );
}

export default Login;
