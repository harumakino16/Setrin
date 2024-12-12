import React, { useEffect } from 'react';

const Modal = ({ isOpen, onClose, children, showCloseButton = true }) => {
    if (!isOpen) return null;

    const handleBackgroundClick = (event) => {
        //画面外をクリックした時にモーダルを閉じる
        // if (event.target === event.currentTarget) {
        //     onClose();
        // }
    };

    const containerClass = React.isValidElement(children) && children.type.name === 'Price'
        ? "bg-white w-full rounded-lg shadow-lg relative max-h-full overflow-y-auto"
        : "bg-white p-8 rounded-lg shadow-lg relative max-h-full overflow-y-auto";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={handleBackgroundClick}>
            <div className={containerClass}>
                {showCloseButton && (
                    <button onClick={onClose} className="absolute top-3 right-3 text-gray-600 hover:text-gray-800">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
                {children}
            </div>
        </div>
    );
};

export default Modal;
