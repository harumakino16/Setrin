import H1 from '@/components/ui/h1';
import Layout from '../layout';
import StartRequestModeCTA from '@/components/StartRequestModeCTA';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';


const Test = () => {
    return (
        <Layout>
            <H1>テストページ</H1>
            <StartRequestModeCTA publicURL="https://www.google.com" />
            <p className="text-red-500 md:text-blue-500">テストページ</p>

        </Layout>
    );
};

export default Test;

// ページで翻訳データを取得する部分
export async function getStaticProps({ locale }) {
    return {
        props: {
            ...(await serverSideTranslations(locale, ['common'])),
        },
    };
}
    