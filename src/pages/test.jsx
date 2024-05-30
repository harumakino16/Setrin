import React, { useState } from 'react';
import axios from 'axios';

const TestPage = () => {
  const [data, setData] = useState(null);

  const handlePostRequest = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/booklog');
      console.log(response);
      setData(response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div>
      <button onClick={handlePostRequest}>Send POST Request</button>
    </div>
  );
};

export default TestPage;
