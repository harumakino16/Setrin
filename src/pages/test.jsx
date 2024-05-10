import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from "@/context/AuthContext";
import { doc, getDoc, setDoc, collection } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

const Test = () => {
  const { currentUser } = useContext(AuthContext);

  const testFanc = async () => {
    const number = await getNumber();
    console.log(number);
  }

  const getNumber = () => {
    setTimeout(() => {
      console.log(5);
    }, 5000);
  }

  console.log(testFanc());
  // console.log(testFanc().then(result => console.log(result)));

  // testFanc()


  return (
    <div>
      <button onClick={() => setCount(count + 1)}>
        {count}
        test修正
      </button>
    </div>
  );
};

export default Test;
