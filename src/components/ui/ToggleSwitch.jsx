// トグルボタンのコンポーネント例
import React from 'react';
import styles from '@/components/ui/ToggleSwitch.module.css'; // CSSファイルをインポート

const ToggleSwitch = ({ isOn, onToggle, onText, offText }) => {
  return (
    <div
      className={`${styles['toggle-switch']} ${isOn ? styles['on'] : ''} hover:cursor-pointer`}
      onClick={onToggle}
    >
      <div className={styles['toggle-knob']}></div>
      <span className={styles['toggle-label']}>{isOn ? onText : offText}</span>
    </div>
  );
};

export default ToggleSwitch;