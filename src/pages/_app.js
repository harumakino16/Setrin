import { AuthProvider } from "@/context/AuthContext";
import "@/styles/globals.css";
import { MessageProvider } from "@/context/MessageContext";
import MessageBox from "@/components/MessageBox";
import { SongsProvider } from "@/context/SongsContext";
import { Noto_Sans_JP } from "next/font/google";
import { ThemeProvider } from "@/context/ThemeContext";

const notoSansJP = Noto_Sans_JP({
  weight: ['400', '700'],
  subsets: ['latin'],
});

export default function App({ Component, pageProps }) {
  const getLayout = Component.getLayout || ((page) => page);

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