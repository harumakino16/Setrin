import { useEffect, useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';
import useGoogleSignUpLogin from '@/hooks/googleSignUpLogin';
import { useRouter } from 'next/router';
import Image from 'next/image';

export default function Login() {
  const { currentUser } = useContext(AuthContext);
  const { handleGoogleSignUpLogin } = useGoogleSignUpLogin();
  const router = useRouter();

  useEffect(() => {
    // すでにログインしている場合はダッシュボードへリダイレクト
    if (currentUser) {
      router.push('/');
    }
  }, [currentUser, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <Image
            className="mx-auto h-12 w-auto"
            src="/images/Setlink_trance_1000x300px.png"
            alt="Setlink"
            width={200}
            height={60}
            priority={true}
          />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Setlinkへようこそ
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            歌枠配信をもっと楽しく、もっと便利に
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <button
            onClick={handleGoogleSignUpLogin}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-customTheme-blue-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
                />
              </svg>
            </span>
            Googleでログイン
          </button>
        </div>
      </div>
    </div>
  );
} 