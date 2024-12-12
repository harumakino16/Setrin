// components/DashboardCard.js
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useTheme } from '@/context/ThemeContext';

const DashboardCard = ({ icon, title, children }) => {
  const { theme } = useTheme();

  return (
    <div
      className="bg-white shadow-lg rounded-lg p-6 mb-6"
      aria-label={title}
    >
      <div className="flex items-center mb-4">
        <FontAwesomeIcon icon={icon} className={`text-3xl text-customTheme-${theme}-primary mr-3`} />
        <h2 className="text-2xl font-semibold text-gray-800 ">{title}</h2>
      </div>
      {children}
    </div>
  );
};

export default DashboardCard;
