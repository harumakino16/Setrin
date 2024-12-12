// components/StatBox.js
import { useTheme } from '@/context/ThemeContext';

const StatBox = ({ label, value, limit }) => {
    const { theme } = useTheme();
    const isLimitNumeric = !isNaN(limit);
    const percentage = isLimitNumeric ? Math.min((value / limit) * 100, 100) : 100;
  
    return (
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-gray-700 text-lg font-bold">{label}</span>
          <span className="text-gray-900 text-lg font-bold">{value} / {limit}</span>
        </div>
        {isLimitNumeric && (
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className={`bg-customTheme-${theme}-primary h-2.5 rounded-full`}
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
        )}
      </div>
    );
  };
  
  export default StatBox;
  