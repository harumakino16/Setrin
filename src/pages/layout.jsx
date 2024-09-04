import Header from '@/components/header';
import { Sidebar } from '@/components/Sidebar';
import Footer from '@/components/footer';
import HeaderPadding from '@/components/headerPadding';

export default function Layout({ children }) {
    return (
        <main className="flex flex-col min-h-screen">
            <Header />
            {/* <HeaderPadding /> */}
            <div className="flex flex-1 bg-[#efeeea] pt-[80px]">
                <Sidebar />
                <main className="flex-1 p-4">
                    {children}
                </main>
            </div>
            <Footer />
        </main>
    );
}