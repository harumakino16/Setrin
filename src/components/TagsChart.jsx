// components/TagsChart.js

import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

// カラージェネレーター関数（HSLを使用して色相を均等に分散）
const generateColors = (num) => {
  const colors = [];
  const step = 360 / num;
  for (let i = 0; i < num; i++) {
    const hue = i * step;
    colors.push(`hsl(${hue}, 70%, 50%)`);
  }
  return colors;
};

// ホバー用の色を生成する関数（HSLAで透明度を追加）
const generateHoverColors = (colors, alpha = 0.8) => {
  return colors.map(color => {
    // 'hsl(...)' を 'hsla(..., alpha)' に変換
    return color.replace('hsl(', 'hsla(').replace(')', `, ${alpha})`);
  });
};

const TagsChart = ({ tags }) => {
  const labels = tags ? Object.keys(tags) : [];
  const dataValues = tags ? Object.values(tags) : [];
  const numTags = labels.length;
  const dynamicColors = generateColors(numTags);
  const hoverColors = generateHoverColors(dynamicColors, 0.7); // 透明度80%に設定

  const chartData = {
    labels: labels,
    datasets: [
      {
        data: dataValues,
        backgroundColor: dynamicColors,
        hoverBackgroundColor: hoverColors,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: '#4B5563', // Tailwindのtext-gray-700に相当
        },
      },
      tooltip: {
        enabled: true,
      },
    },
    maintainAspectRatio: false,
  };

  return (
    <div className="w-full h-64">
      <Doughnut data={chartData} options={chartOptions} />
    </div>
  );
};

export default TagsChart;
