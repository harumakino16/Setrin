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

  const backgroundColor = messageInfo.type === 'error' ? '#ffeff1' : 
                         messageInfo.type === 'success' ? '#e9feee' : 
                         messageInfo.type === 'warning' ? '#fcfae2' : 
                         '#e9f5fb';

  const fontColor = messageInfo.type === 'error' ? '#ff565c' : 
                    messageInfo.type === 'success' ? '#00d05e' : 
                    messageInfo.type === 'warning' ? '#ffd923' : 
                    '#01a2ff';

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor,
      color: fontColor,
      border: `1px solid ${fontColor}`,
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
