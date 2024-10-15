// pages/api/booklog.js
export default function handler(req, res) {
  
  if (req.method === 'GET') {
    
    
    // POSTリクエストを処理するコードをここに記述
    res.status(200).json({
      OK: true,
      message: "成功",
      name: "ひろみ"
    });
    
  } else {
    
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}