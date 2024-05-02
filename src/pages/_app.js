import { AuthProvider } from "@/context/AuthContext";
import "@/styles/globals.css";
import { MessageProvider, useMessage } from "@/context/MessageContext";
import MessageBox from "@/components/MessageBox";


export default function App({ Component, pageProps }) {

  return (
    <AuthProvider>
      <MessageProvider>
        <Component {...pageProps} />
        <MessageBox /> {/* MessageBox を直接 MessageProvider の子として配置 */}
      </MessageProvider>
    </AuthProvider>
  )
}
