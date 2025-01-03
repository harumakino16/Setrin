import Header from '@/components/header';
import Footer from '@/components/footer';

export default function NoSidebarLayout({ children, meta }) {
  return (
    <div>
      <Header meta={meta} />
      <div className="bg-[#efeeea] min-h-screen">
        <main className="md:p-4 p-2 w-full">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
} 