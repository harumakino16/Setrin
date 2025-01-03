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
  const router = useRouter();
  const getLayout = Component.getLayout || ((page) => page);

  // 言語の初期化処理を修正
  useEffect(() => {
    // URLから指定された言語を優先
    const urlLocale = router.locale;
    const savedLang = localStorage.getItem('language');
    console.log('savedLang', savedLang);
    console.log('urlLocale', urlLocale);
    

    // ローカルストレージに保存がない場合はURLの言語を保存
    if (!savedLang && urlLocale) {
      localStorage.setItem('language', urlLocale);
    }
    // URLの言語とローカルストレージの言語が異なる場合のみリダイレクト
    else if (savedLang && urlLocale !== savedLang) {
      router.push(router.pathname, router.asPath, { 
        locale: savedLang,
        scroll: false 
      });
    }
  }, [router.locale]);

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
