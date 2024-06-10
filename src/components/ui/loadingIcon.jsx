import React from 'react';

const LoadingIcon = () => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <svg
        width="30"
        height="30"
        viewBox="0 0 50 50"
        xmlns="http://www.w3.org/2000/svg"
        style={{ margin: 'auto', display: 'block', shapeRendering: 'auto' }}
      >
        <circle
          cx="25"
          cy="25"
          fill="none"
          stroke="#ffffff"
          strokeWidth="4"
          r="20"
          strokeDasharray="94.24777960769379 33.41592653589793"
          transform="rotate(72 25 25)"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            repeatCount="indefinite"
            dur="1s"
            values="0 25 25;360 25 25"
            keyTimes="0;1"
          />
        </circle>
      </svg>
    </div>
  );
};

export default LoadingIcon;
