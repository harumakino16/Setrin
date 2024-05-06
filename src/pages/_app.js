import { AuthProvider } from "@/context/AuthContext";
import "@/styles/globals.css";
import { MessageProvider, useMessage } from "@/context/MessageContext";
import MessageBox from "@/components/MessageBox";
import Footer from "../components/footer"; // Footer コンポーネントをインポート
import Header from "../components/header"; // Header コンポーネントをインポート
import HeaderPadding from "../components/headerPadding"; // HeaderPadding コンポーネントをインポート


export default function App({ Component, pageProps }) {

  return (
    <AuthProvider>
      <MessageProvider>
        <Header />
        <HeaderPadding />
        <Component {...pageProps} />
        <MessageBox /> {/* MessageBox を直接 MessageProvider の子として配置 */}
        <Footer />

      </MessageProvider>
    </AuthProvider>
  )
}
