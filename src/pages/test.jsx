import React, { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const Test = () => {
  const [count, setCount] = useState(0);
  console.log("ちょっとした修正");

  console.count("レンダリングされました");
  useEffect(() => {
    if (count === 1) {
      console.count("useEffect");
    }
  }, [count]);

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>
        {count}
      </button>
    </div>
  );
};

export default Test;
