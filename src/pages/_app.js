import { AuthProvider } from "@/context/AuthContext";
import "@/styles/globals.css";
import { MessageProvider, useMessage } from "@/context/MessageContext";
import MessageBox from "@/components/MessageBox";
import Footer from "../components/footer"; // Footer コンポーネントをインポート
import Header from "../components/header"; // Header コンポーネントをインポート
import HeaderPadding from "../components/headerPadding"; // HeaderPadding コンポーネントをインポート
import { SongsProvider } from "@/context/SongsContext";
import { Noto_Sans_JP } from "next/font/google";
import Layout from "./layout";

const notoSansJP = Noto_Sans_JP({
  weight: ['400', '700'], // 必要なウェイトを指定
  subsets: ['latin'], // 必要なサブセットを指定
});

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <MessageProvider>
        <SongsProvider>
          <div className={notoSansJP.className}>
            <Layout>
              <Component {...pageProps} />
              <MessageBox />
            </Layout>
          </div>
        </SongsProvider>
      </MessageProvider>
    </AuthProvider>
  );
}