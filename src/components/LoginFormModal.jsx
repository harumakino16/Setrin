import Modal from '@/components/Modal';
import LoginForm from './LoginForm';

const LoginFormModal = ({ isOpen }) => {

    const openModal = () => {
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
    };

    return (
        <div>
            <Modal isOpen={isOpen} showCloseButton={false}>
                <div className="text-xl text-center">ご利用にはログインが必要です</div>
                <LoginForm />
            </Modal>
        </div>
    );
};

export default LoginFormModal;
