import Layout from '@/pages/layout';
import FeedbackForm from '@/components/FeedbackForm';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';


const FeedbackPage = () => {
    const { t } = useTranslation('common');
    const meta = {    
        title: 'フィードバック',
        description: 'Setlinkのフィードバックフォームです。',
        path: '/feedback',
        isPublic: true
    };
    return (
        <Layout meta={meta}>
            <div className="py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-10">
                    <h3 className="text-xl font-bold">フィードバック</h3>
                    <p className="mt-1 text-sm text-gray-600">
                        バグ報告や機能提案など、お気軽にご意見をお寄せください。
                    </p>
                </div>
                <div className="">
                    <FeedbackForm />
                </div>
            </div>
        </Layout>
    );
};

export default FeedbackPage;

export async function getStaticProps({ locale }) {
    return {
        props: {
            ...(await serverSideTranslations(locale, ['common'])),
        },
    };
}
