import { faMusic } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faHistory, faHome, faTools } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { useState, useContext, useEffect } from "react";
import { useRouter } from "next/router";
import { AuthContext } from '../context/AuthContext'; // AuthContextをインポート
import useLogOut from '../hooks/logOut';
import { useMessage } from '@/context/MessageContext';
import CreateRandomSetlist from '@/components/CreateRandomSetlist'; // createsetlistをインポート



const MENU = [
    {
        title: "曲リスト",
        iconName: faMusic,
        path: "/",
    },
    {
        title: "セットリスト",
        iconName: faHistory,
        path: "/setlist",
    },
    {
        title: "設定",
        iconName: faTools,
        path: "/setting",
    },

]

export function Sidebar() {
    const router = useRouter();
    const { currentUser } = useContext(AuthContext); // currentUserを取得
    const logOut = useLogOut();
    const { setMessageInfo } = useMessage();
    const [showCreateSetlistModal, setShowCreateSetlistModal] = useState(false);

    const handleCreateSetlist = () => {
        setShowCreateSetlistModal(true);
    };

    const handleCloseModal = () => {
        setShowCreateSetlistModal(false);
    };

    return (
        // {/* Sidebar */ }
            <div className="sidebar w-64 min-w-[256px] flex flex-col justify-between">
                <div>
                    <div className="flex flex-col items-center py-4">
                        <div className="text-gray-700 text-2xl font-semibold">メニュー</div>
                    </div>
                    <div className="mt-8">
                        <ul>
                            {MENU.map((item) => {
                                return (
                                    <Link key={item.title} href={item.path}>
                                        <li className={`flex items-center text-gray-700 text-sm font-medium py-2 px-6 ${router.pathname === item.path ? 'bg-gray-200' : 'hover:bg-gray-200'} cursor-pointer gap-2`}>
                                            <FontAwesomeIcon icon={item.iconName} />{item.title}
                                        </li>
                                    </Link>
                                )
                            })}
                        </ul>
                    </div>
                    <div className="mt-4 px-6">
                        <button onClick={handleCreateSetlist} className="bg-blue-400 hover:bg-blue-400 text-white font-bold py-3 px-4 rounded flex items-center justify-center w-full">
                            セトリを作る
                        </button>
                    </div>
                </div>

                <CreateRandomSetlist isOpen={showCreateSetlistModal} onClose={handleCloseModal} />
            </div>
    );
}

