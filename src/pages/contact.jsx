import NoSidebarLayout from '@/pages/noSidebarLayout';
import ContactForm from '@/components/ContactForm';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

const Contact = () => {
  const { t } = useTranslation('common');

  return (
    <NoSidebarLayout>
      <ContactForm />
    </NoSidebarLayout>
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
