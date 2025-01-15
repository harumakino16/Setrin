import { DefaultSeo } from 'next-seo';
import { AuthProvider } from "@/context/AuthContext";
import "@/styles/globals.css";
import { MessageProvider } from "@/context/MessageContext";
import MessageBox from "@/components/MessageBox";
import { SongsProvider } from "@/context/SongsContext";
import { Noto_Sans_JP } from "next/font/google";
import { ThemeProvider } from "@/context/ThemeContext";
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { appWithTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

config.autoAddCss = false;

const notoSansJP = Noto_Sans_JP({
  weight: ['400', '700'],
  subsets: ['latin'],
});

const DEFAULT_SEO = {
  title: 'Setlink - VTuberのための歌枠支援ツール',
  description: 'Setlinkは、VTuber・配信者向けの歌枠総合支援ツールです。曲管理、セットリスト作成、リクエスト管理など、歌枠配信に必要な全ての機能が揃っています。',
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    url: 'https://setlink.jp/',
    site_name: 'Setlink',
    title: 'Setlink - VTuberのための歌枠支援ツール',
    description: 'Setlinkは、VTuber・配信者向けの歌枠総合支援ツールです。曲管理、セットリスト作成、リクエスト管理など、歌枠配信に必要な全ての機能が揃っています。',
    images: [
      {
        url: 'https://setlink.jp/images/bunner.png',
        width: 1200,
        height: 630,
        alt: 'Setlink',
      },
    ],
  },
  twitter: {
    handle: '@setlink_jp',
    site: '@setlink_jp',
    cardType: 'summary_large_image',
  },
};

function App({ Component, pageProps }) {
  const router = useRouter();
  const getLayout = Component.getLayout || ((page) => page);

  useEffect(() => {
    const urlLocale = router.locale;
    const savedLang = localStorage.getItem('language');
    console.log('savedLang', savedLang);
    console.log('urlLocale', urlLocale);
    
    if (!savedLang && urlLocale) {
      localStorage.setItem('language', urlLocale);
    }
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
            <DefaultSeo {...DEFAULT_SEO} />
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

export default appWithTranslation(App);
