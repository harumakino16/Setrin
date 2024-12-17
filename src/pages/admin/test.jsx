import H1 from '@/components/ui/h1';
import Layout from '../layout';
import StartRequestModeCTA from '@/components/StartRequestModeCTA';

const Test = () => {
    return (
        <Layout>
            <H1>テストページ</H1>
            <StartRequestModeCTA publicURL="https://www.google.com" />
        </Layout>
    );
};

export default Test;

