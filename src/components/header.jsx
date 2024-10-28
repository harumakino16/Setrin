import Link from 'next/link';
import Image from 'next/image';
import { FaBars } from 'react-icons/fa'; // ReactIconをインポート
import { useTheme } from '../context/ThemeContext';
const Header = ({ toggleSidebar }) => {
    const { theme } = useTheme();
    return (
        <header className={`bg-customTheme-${theme}-primary shadow-lg`}>
            <div className="container mx-auto flex justify-between items-center h-[60px]">
                <Link href="/">
                    <Image
                        src="/images/SetLink_white_trance (1000 x 300 px).png"
                        alt="SetLink Logo"
                        width={190}
                        height={50}
                    />
                </Link>
                <button className="md:hidden text-white" onClick={toggleSidebar}>
                    <FaBars size={24} />
                </button>
            </div>
        </header>
    );
};

export default Header;
