import React from 'react';
import Modal from '@/components/Modal';
import { useTranslation } from 'next-i18next';

const ColumnSettingsModal = ({ isOpen, onClose, visibleColumns, toggleColumnVisibility }) => {
  const { t } = useTranslation('common');
  
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">{t('columnDisplaySettings')}</h2>
        <div className="">
          {Object.entries(visibleColumns).map(([key, { label, visible, removable }]) => (
            <div 
              key={key} 
              className={`flex items-center p-3 rounded-lg transition-colors
                ${removable ? 'hover:bg-gray-50' : 'opacity-75'}
              `}
            >
              <div className="relative inline-block w-10 mr-4 align-middle">
                <input
                  type="checkbox"
                  id={key}
                  checked={visible}
                  onChange={() => toggleColumnVisibility(key)}
                  disabled={!removable}
                  className="peer hidden"
                />
                <label
                  htmlFor={key}
                  className={`block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer
                    ${!removable ? 'cursor-not-allowed' : ''}
                    peer-checked:bg-blue-500 peer-disabled:bg-gray-200`}
                >
                  <span className={`
                    absolute block w-4 h-4 rounded-full bg-white shadow transform transition-transform duration-200 ease-in-out
                    left-1 top-1 peer-checked:translate-x-4
                  `}></span>
                </label>
              </div>
              <label 
                htmlFor={key} 
                className={`flex-grow text-base
                  ${removable ? 'text-gray-700 cursor-pointer' : 'text-gray-400 cursor-not-allowed'}
                `}
              >
                {label}
              </label>
            </div>
          ))}
        </div>
        <div className="mt-8 text-center">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors w-full"
          >
            {t('done')}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ColumnSettingsModal;
