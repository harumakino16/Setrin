// components/Badge.js
import { useTheme } from '@/context/ThemeContext';

const Badge = ({ label }) => {
    const { theme } = useTheme();
    return (
      <span
        className={`inline-block bg-customTheme-${theme}-primary text-white px-3 py-1 rounded-full text-sm transition duration-300 ease-in-out hover:bg-customTheme-${theme}-secondary`}
        aria-label={label}
      >
        {label}
      </span>
    );
  };
  
  export default Badge;
  