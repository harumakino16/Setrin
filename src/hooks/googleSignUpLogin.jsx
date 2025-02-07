// googleSignUpLogin.jsx
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { doc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { registerUserInFirestore } from "@/utils/firebaseUtils";
import { useMessage } from "@/context/MessageContext";
import { useRouter } from "next/router";
import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";

const useGoogleSignUpLogin = () => {
  const { setCurrentUser } = useContext(AuthContext);
  const { setMessageInfo } = useMessage();
  const router = useRouter();

  // UTMパラメータを取得する関数
  const getUtmParams = () => {
    // router.query のキーは小文字で取得されることが多いので注意
    const { utm_source, utm_medium, utm_campaign } = router.query;
    return {
      utmSource: utm_source,
      utmMedium: utm_medium,
      utmCampaign: utm_campaign,
    };
  };

  // リファラー情報を取得する関数
  const getReferrer = () => {
    if (typeof document !== "undefined") {
      const referrer = document.referrer;
      // 特定のドメインからの流入を変換
      if (referrer === "https://setlink.jp/lp") {
        return "direct";
      }
      if (referrer === "https://t.co/") {
        return "twitter";
      }
      if (referrer === "https://www.youtube.com/") {
        return "youtube";
      }
      if (referrer === "https://www.bing.com/") {
        return "bing";
      }
      if (referrer === "https://www.google.com/") {
        return "google";
      }
      return referrer || "direct";
    }
    return "direct";
  };

  // 流入元(signUpSource)の決定 (UTMパラメータがあればそれを、なければリファラー)
  const determineSignUpSource = () => {
    const { utmSource } = getUtmParams();
    return utmSource ? utmSource : getReferrer();
  };

  // 広告経由かどうか(isAd)の判定
  // utm_source に「ad」が含まれている、または utm_medium が "cpc" なら広告経由と判定
  const determineIsAd = () => {
    const { utmSource, utmMedium } = getUtmParams();
    if (utmSource) {
      if (
        utmSource.toLowerCase().includes("ad") ||
        (utmMedium && utmMedium.toLowerCase() === "cpc")
      ) {
        return true;
      }
    }
    return false;
  };

  const handleGoogleSignUpLogin = async () => {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);

      const signUpSource = determineSignUpSource();
      const isAd = determineIsAd();

      if (!userDoc.exists()) {
        // 新規ユーザーの場合は、isAd と signUpSource の両方を明示的に保存
        await registerUserInFirestore({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          signUpSource: signUpSource, // 例："twitter"
          isAd: isAd,               // true または false
          createdAt: serverTimestamp(),
          lastActivityAt: serverTimestamp(),
        });
        setMessageInfo({ message: "アカウントが作成されました", type: "success" });
      } else {
        setCurrentUser(user);
        setMessageInfo({ message: "ログインしました", type: "success" });
      }
      router.push("/");
    } catch (error) {
      console.error("Google login error:", error);
      setMessageInfo({ message: "Googleログインに失敗しました", type: "error" });
    }
  };

  return { handleGoogleSignUpLogin };
};

export default useGoogleSignUpLogin;
