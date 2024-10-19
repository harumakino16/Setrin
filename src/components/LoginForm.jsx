import { FcGoogle } from "react-icons/fc";
import useGoogleSignUpLogin from '@/hooks/googleSignUpLogin';

const LoginForm = () => {
    const { handleGoogleSignUpLogin } = useGoogleSignUpLogin();
    return (
        <div className=" w-[600px] mx-auto p-10 pb-5 bg-white rounded-lg">
            <h1 className="text-xl font-bold mb-4 text-center">ログイン</h1>
            <div className="flex flex-col space-y-4 mb-5">
                <button onClick={handleGoogleSignUpLogin} className="bg-white hover:bg-gray-100 text-gray-700 font-semibold py-4 px-4 border border-gray-200 rounded w-full">
                    <div className="flex items-center justify-start space-x-2">
                        <FcGoogle size={24} />
                        <span className="flex-grow text-center">Googleでログイン</span>
                    </div>
                </button>
            </div>
            {/* <div className="flex flex-col space-y-1 mb-5">
                <p className="text-center text-gray-500 text-sm">ログインできない方はこちら</p>
            </div> */}
        </div>
    );
};

export default LoginForm;
