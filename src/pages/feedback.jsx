import Layout from '@/pages/layout';
import FeedbackForm from '@/components/FeedbackForm';

const FeedbackPage = () => {
    return (
        <Layout>
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