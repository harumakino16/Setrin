import { useContext, useEffect } from 'react';
import { AuthContext } from '@/context/AuthContext';
import { useRouter } from 'next/router';
import { useMessage } from '@/context/MessageContext';
import Loading from '@/components/loading';

const withAdminAuth = (WrappedComponent) => {
  return (props) => {
    const { currentUser, loading, isAdmin } = useContext(AuthContext);
    const router = useRouter();
    const { setMessageInfo } = useMessage();

    useEffect(() => {
      if (!loading) {
        if (!currentUser) {
          setMessageInfo({ message: 'ログインが必要です。', type: 'error' });
          router.push('/login');
        } else if (!isAdmin) {
          setMessageInfo({ message: '管理者権限がありません。', type: 'error' });
          router.push('/');
        }
      }
    }, [loading, currentUser, isAdmin]);

    if (loading || !isAdmin) {
      return <Loading />;
    }

    return <WrappedComponent {...props} />;
  };
};

export default withAdminAuth; 