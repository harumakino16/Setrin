// components/StatBox.js
const StatBox = ({ label, value, limit }) => {
    const percentage = limit !== '制限なし' ? (value / limit) * 100 : 100;
  
    return (
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-gray-700">{label}</span>
          <span className="text-gray-900 font-semibold">{value} / {limit}</span>
        </div>
        {limit !== '制限なし' && (
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
        )}
      </div>
    );
  };
  
  export default StatBox;
  