import React from 'react';
import Modal from '@/components/modal';

const ColumnSettingsModal = ({ isOpen, onClose, visibleColumns, toggleColumnVisibility }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-xl font-bold mb-4">列の表示設定</h2>
      <div className="space-y-2">
        {Object.entries(visibleColumns).map(([key, { label, visible, removable }]) => (
          <div key={key} className="flex items-center">
            <input
              type="checkbox"
              id={key}
              checked={visible}
              onChange={() => toggleColumnVisibility(key)}
              disabled={!removable}
              className="mr-2"
            />
            <label htmlFor={key} className={removable ? '' : 'text-gray-500'}>
              {label}
            </label>
          </div>
        ))}
      </div>
    </Modal>
  );
};

export default ColumnSettingsModal;
