// MessageBox.js
import React, { useState, useEffect } from 'react';
import { useMessage } from '@/context/MessageContext';
import { FaExclamationCircle, FaCheckCircle, FaInfoCircle, FaExclamationTriangle } from 'react-icons/fa';

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

  const backgroundColor = messageInfo.type === 'error' ? '#ff565c' : 
                         messageInfo.type === 'success' ? '#00d05e' : 
                         messageInfo.type === 'warning' ? '#ffd923' : 
                         '#01a2ff';

  const Icon = messageInfo.type === 'error' ? FaExclamationCircle :
               messageInfo.type === 'success' ? FaCheckCircle :
               messageInfo.type === 'warning' ? FaExclamationTriangle :
               FaInfoCircle;

  return (
    <div style={{
      position: 'fixed',
      bottom: '30px',
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor,
      color: '#fff',
      fontWeight: 'bold',
      padding: '10px 50px 10px 10px',
      borderRadius: '5px',
      zIndex: 1000,
      opacity,
      transition: 'opacity 0.5s ease-in-out, transform 0.5s ease-in-out',
      transform: visible ? 'translateY(0)' : 'translateY(20px)' // フワッと表示
    }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Icon style={{ marginRight: '10px' }} />
        <span>{messageInfo.message}</span>
      </div>
    </div>
  );
};

export default MessageBox;
