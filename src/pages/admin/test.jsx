import H1 from '@/components/ui/h1';
import Layout from '../layout';
import ctaComponent from '@/components/CtaComponent';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useState, useEffect } from 'react';


const Test = () => {
    useEffect(() => {
        localStorage.setItem('showRequestModeCTA', 1);
    }, []);
    console.log(localStorage.getItem('showRequestModeCTA'));

    return (
        <Layout>
            <H1>テストページ</H1>
            {localStorage.getItem('showRequestModeCTA') === 1 && <ctaComponent publicURL="https://www.google.com" />}
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
    