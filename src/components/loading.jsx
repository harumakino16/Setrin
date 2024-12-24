import React from 'react';
import Image from 'next/image';
import styles from './Loading.module.css';

const Loading = () => {
  return (
    <div className={styles.overlay}>
      <div className={styles.logoContainer}>
        <Image
          src="/images/Setlink_trance_1000x300px.png"
          alt="Setlinkロゴ"
          width={200}
          height={60}
          priority={true}
          className={styles.logo}
        />
        <div className={styles.loadingDots}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  );
};

export default Loading;
