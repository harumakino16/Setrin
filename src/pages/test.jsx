import React, { useEffect, useState, useContext } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useSongs } from '../context/SongsContext';
import useFetchSongs from '../hooks/fetchSongs';
import { AuthContext } from "@/context/AuthContext";


const Test = () => {
  const { currentUser } = useContext(AuthContext);
  useFetchSongs(currentUser);
  const { songs } = useSongs();
  
  console.log(songs);



  return (
    <div>
     {songs.map((song) => (
      <p>{song.title}</p>
     ))}
    </div>
  );
};

export default Test;
