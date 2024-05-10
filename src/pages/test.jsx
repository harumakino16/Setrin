import React, { useEffect, useState, useContext } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useSongs } from '../context/SongsContext';
import useFetchSongs from '../hooks/fetchSongs';
import { AuthContext } from "@/context/AuthContext";


const Test = () => {
  const [count, setCount] = useState(0);
  console.log("ちょっとした修正");
  const { currentUser } = useContext(AuthContext);
  useFetchSongs(currentUser);
  const { songs } = useSongs();
  
  console.log(songs);



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
