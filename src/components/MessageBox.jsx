// MessageBox.js
import React, { useState, useEffect } from 'react';
import { useMessage } from '@/context/MessageContext';

const MessageBox = () => {
  const { messageInfo } = useMessage();
  const [visible, setVisible] = useState(false);
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    if (messageInfo.message) {
      setVisible(true);
      setOpacity(1);
      const timer = setTimeout(() => {
        setOpacity(0);
        setTimeout(() => {
          setVisible(false);
        }, 500); // フェードアウト後に非表示
      }, 3500); // 4秒後にフェードアウト開始
      return () => clearTimeout(timer);
    }
  }, [messageInfo]); // messageInfo全体に依存

  if (!visible) return null;

  const backgroundColor = messageInfo.type === 'error' ? 'rgba(255, 0, 0, 0.7)' : 
                         messageInfo.type === 'success' ? 'rgba(0, 128, 0, 0.7)' : 
                         'rgba(255, 255, 0, 0.7)';

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor,
      color: 'white',
      padding: '10px 20px',
      borderRadius: '10px',
      zIndex: 1000,
      opacity,
      transition: 'opacity 0.5s ease-in-out'
    }}>
      {messageInfo.message}
    </div>
  );
};

export default MessageBox;
