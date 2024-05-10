import { AuthProvider } from "@/context/AuthContext";
import "@/styles/globals.css";
import { MessageProvider, useMessage } from "@/context/MessageContext";
import MessageBox from "@/components/MessageBox";
import Footer from "../components/footer"; // Footer コンポーネントをインポート
import Header from "../components/header"; // Header コンポーネントをインポート
import HeaderPadding from "../components/headerPadding"; // HeaderPadding コンポーネントをインポート
import { SongsProvider } from "@/context/SongsContext";

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <MessageProvider>
        <SongsProvider> {/* SongsProvider を追加 */}
          <Header />
          <HeaderPadding />
          <Component {...pageProps} />
          <MessageBox /> {/* MessageBox を直接 MessageProvider の子として配置 */}
          <Footer />
        </SongsProvider>
      </MessageProvider>
    </AuthProvider>
  );
}