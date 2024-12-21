import { AuthProvider } from "@/context/AuthContext";
import "@/styles/globals.css";
import { MessageProvider } from "@/context/MessageContext";
import MessageBox from "@/components/MessageBox";
import { SongsProvider } from "@/context/SongsContext";
import { Noto_Sans_JP } from "next/font/google";
import { ThemeProvider } from "@/context/ThemeContext";
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css'; // Font Awesome CSSを手動で読み込む
import { appWithTranslation } from 'next-i18next'; // 追加
import { useRouter } from 'next/router'; // 追加
import { useEffect } from 'react'; // 追加

config.autoAddCss = false; // CSS自動追加を無効化

const notoSansJP = Noto_Sans_JP({
  weight: ['400', '700'],
  subsets: ['latin'],
});

function App({ Component, pageProps }) {
  const router = useRouter(); // 追加
  const getLayout = Component.getLayout || ((page) => page);

  // 言語の初期設定を追加
  useEffect(() => {
    const savedLang = localStorage.getItem('language') || 'ja';
    if (router.locale !== savedLang) {
      router.push(router.pathname, router.asPath, { locale: savedLang });
    }
  }, []);

  return (
    <AuthProvider>
      <ThemeProvider>
        <MessageProvider>
          <SongsProvider>
            <div className={notoSansJP.className}>
              {getLayout(<Component {...pageProps} />)}
              <MessageBox />
            </div>
          </SongsProvider>
        </MessageProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default appWithTranslation(App); // appWithTranslationを適用
