// components/Skeleton.js
const Skeleton = () => {
    return (
      <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <div className="bg-gray-300 dark:bg-gray-600 h-10 w-10 rounded-full mr-4"></div>
          <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
        </div>
        <div className="space-y-4">
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-5/6"></div>
        </div>
      </div>
    );
  };
  
  export default Skeleton;
  