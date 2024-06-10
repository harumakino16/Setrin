import LoadingIcon from "@/components/ui/loadingIcon";
import { useState } from "react";


const TestPage = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      
    }, 3000);

  };

  return (
    <div>
      <button onClick={handleClick} className="bg-blue-500 p-2 rounded-md w-40">
        {isLoading ? <LoadingIcon /> : 'Send POST Request'}
      </button>
    </div>
  );
};

export default TestPage;
