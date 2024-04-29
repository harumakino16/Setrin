import { useState } from 'react';
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { useRouter } from 'next/router';
import Link from 'next/link'; // Linkコンポーネントをインポート

function Signup() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const auth = getAuth();
    const router = useRouter();

    const handleSignup = async () => {
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            console.log('登録成功:');
            router.push('/');
        } catch (error) {
            console.error('登録失敗:', error);
            alert('登録に失敗しました。');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <div className="w-full max-w-xs">
                <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                            メールアドレス
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="メールアドレス"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                            パスワード
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="******************"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                        />
                    </div>
                    <div className="">
                        <button
                            onClick={handleSignup}
                            type="button"
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
                        >
                            登録
                        </button>
                        <Link href="/signin" className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800">
                            既にアカウントをお持ちですか？ログイン
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Signup;
