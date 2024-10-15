import React, { useState, useEffect } from 'react';

const ScheduleApp = () => {
  const [dates, setDates] = useState([]);
  const [dateInput, setDateInput] = useState('');
  const [timeInput, setTimeInput] = useState('14:00');

  useEffect(() => {
    const today = new Date();
    today.setFullYear(today.getFullYear());
    setDateInput(today.toISOString().split('T')[0]);
  }, []);

  const addDate = () => {
    setDates([...dates, { date: dateInput, time: timeInput, id: Date.now() }]);
  };

  const removeDate = (id) => {
    setDates(dates.filter(date => date.id !== id));
  };

  const generateOutputText = () => {
    let outputText = `お世話になっております。
以下の候補日からお願いいたします。

1回目\n`;
    dates.forEach((date, index) => {
      const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][new Date(date.date).getDay()];
      const formattedDate = `${new Date(date.date).getMonth() + 1}/${new Date(date.date).getDate()}(${dayOfWeek}) ${date.time}〜`;
      if (index === 3) outputText += "\n2回目\n";
      outputText += `・${formattedDate}\n`;
    });

    return outputText.trim();
  };

  const copyToClipboard = () => {
    const textToCopy = generateOutputText();
    navigator.clipboard.writeText(textToCopy).then(() => {
      alert('コピーしました！');
    }, (err) => {
      
    });
  };

  return (
    <div className="max-w-xl mx-auto my-8">
      <div className="flex gap-2 mb-4">
        <input
          type="date"
          value={dateInput}
          onChange={(e) => setDateInput(e.target.value)}
          className="border p-2 rounded-lg"
        />
        <input
          type="time"
          value={timeInput}
          onChange={(e) => setTimeInput(e.target.value)}
          defaultValue="14:00"
          className="border p-2 rounded-lg"
        />
        <button onClick={addDate} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          日程を追加
        </button>
      </div>
      <ul className="mb-4">
        {dates.map((date) => (
          <li key={date.id} className="flex justify-between items-center mb-2 p-2 bg-gray-100 rounded">
            {date.date} {date.time}
            <button onClick={() => removeDate(date.id)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded">
              削除
            </button>
          </li>
        ))}
      </ul>
      <button onClick={copyToClipboard} className="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
        日程を出力
      </button>
    </div>
  );
};

export default ScheduleApp;
