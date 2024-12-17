import H1 from '@/components/ui/h1';
import Layout from '../layout';
import StartRequestModeCTA from '@/components/StartRequestModeCTA';

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

