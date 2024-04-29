import { faMusic } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faHistory, faHome, faTools } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { useState, useContext, useEffect } from "react";
import { useRouter } from "next/router";
import { AuthContext } from '../context/AuthContext'; // AuthContextをインポート
import { useLogOut } from '../hooks/logOut';

const MENU = [
    {
        title: "セトリ作成",
        iconName: faMusic,
        path: "/createsetlist",
    },
    {
        title: "曲リスト",
        iconName: faMusic,
        path: "/",
    },
    {
        title: "セトリ履歴",
        iconName: faHistory,
        path: "/setlisthistory",
    },
    {
        title: "設定",
        iconName: faTools,
        path: "/setting",
    },
]

export function Sidebar() {
    const [showModal, setShowModal] = useState(false);
    const router = useRouter();
    const { currentUser } = useContext(AuthContext); // currentUserを取得


    return (
        // {/* Sidebar */ }
        <div className="w-64 h-screen bg-white shadow-md flex flex-col justify-between">
            <div>
                <div className="flex flex-col items-center py-4">
                    <div className="text-gray-700 text-2xl font-semibold">メニュー</div>
                </div>
                <div className="mt-8">
                    <ul>
                        {MENU.map((item) => {
                            return (
                                <Link key={item.title} href={item.path}>
                                    <li className="flex items-center text-gray-700 text-sm font-medium py-2 px-6 hover:bg-gray-200 cursor-pointer gap-2">
                                        <FontAwesomeIcon icon={item.iconName} />{item.title}
                                    </li>
                                </Link>
                            )
                        })}
                    </ul>
                </div>
            </div>
            <div className=" flex flex-col px-6 pb-4 gap-3">
                {currentUser ? (
                    <>
                        <button onClick={useLogOut} className="bg-red-500 text-white text-sm font-medium py-2 px-4 rounded-full w-full">ログアウト</button>
                        <button className="bg-red-500 text-white text-sm font-medium py-2 px-4 rounded-full w-full">現在のユーザーを削除</button>
                    </>
                ) : (
                    <>
                        <button className="bg-blue-500 text-white text-sm font-medium py-2 px-4 rounded-full w-full" onClick={() => router.push('/SigninAndSignupForm')}>ログイン</button>
                    </>
                )}
            </div>
        </div>
    );
}
