// pages/api/booklog.js
export default function handler(req, res) {
    console.log("開始");
    if (req.method === 'GET') {
        console.log("GETです");
        console.log(req.query);
        // POSTリクエストを処理するコードをここに記述
        res.status(200).json({
             OK: true,
             message: "成功",
            name: "ひろみ" });
            console.log(res.status(200));
    } else {
        console.log("GETではありません");
      res.setHeader('Allow', ['GET']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  }
  