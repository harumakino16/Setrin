import NoSidebarLayout from '@/pages/noSidebarLayout';
import ContactForm from '@/components/ContactForm';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { NextSeo } from 'next-seo';

const Contact = () => {
  const { t } = useTranslation('common');
  const seoData = {
    title: 'お問い合わせ | Setlink - VTuberのための歌枠支援ツール',
    description: 'Setlinkへのお問い合わせはこちらから。サービスに関するご質問、ご要望、不具合の報告などを承っております。',
    openGraph: {
      title: 'お問い合わせ | Setlink',
      description: 'Setlinkへのお問い合わせはこちらから。サービスに関するご質問、ご要望、不具合の報告などを承っております。',
      url: 'https://setlink.jp/contact',
      type: 'website',
      images: [
        {
          url: 'https://setlink.jp/images/bunner.png',
          width: 1200,
          height: 630,
          alt: 'Setlink',
        },
      ],
    },
  };

  return (
    <>
      <NextSeo {...seoData} />
      <NoSidebarLayout>
        <ContactForm />
      </NoSidebarLayout>
    </>
  );
};

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}

export default Contact;
