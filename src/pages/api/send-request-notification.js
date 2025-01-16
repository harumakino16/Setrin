import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { to, songTitle, requesterName, pageName, pageUrl, isFirstTime, requestedAt } = req.body;

        if (!to || !songTitle || !requesterName || !pageName || !pageUrl) {
            return res.status(400).json({ message: '必要な情報が不足しています。' });
        }

        // 時刻を日本時間でフォーマット
        const timeStr = new Date(requestedAt).toLocaleString('ja-JP', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZone: 'Asia/Tokyo'
        });

        const htmlContent = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #A6D9FF;">新しいリクエストが届きました！</h2>
                <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                    <tr>
                        <th style="text-align: left; padding: 10px; background-color: #f3f4f6; border: 1px solid #e5e7eb;">項目</th>
                        <th style="text-align: left; padding: 10px; background-color: #f3f4f6; border: 1px solid #e5e7eb;">内容</th>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border: 1px solid #e5e7eb;">リクエスト曲</td>
                        <td style="padding: 10px; border: 1px solid #e5e7eb;">${songTitle}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border: 1px solid #e5e7eb;">送信者</td>
                        <td style="padding: 10px; border: 1px solid #e5e7eb;">${requesterName}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border: 1px solid #e5e7eb;">初見</td>
                        <td style="padding: 10px; border: 1px solid #e5e7eb;">${isFirstTime ? '初見' : '常連'}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border: 1px solid #e5e7eb;">リクエスト時刻</td>
                        <td style="padding: 10px; border: 1px solid #e5e7eb;">${timeStr}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border: 1px solid #e5e7eb;">公開ページ</td>
                        <td style="padding: 10px; border: 1px solid #e5e7eb;">${pageName}</td>
                    </tr>
                </table>
                <div style="margin-top: 20px;">
                    <a href="${pageUrl}" style="display: inline-block; padding: 10px 20px; background-color: #A6D9FF; color: white; text-decoration: none; border-radius: 5px;">
                        リクエストを確認する
                    </a>
                </div>
                <p style="color: #6b7280; font-size: 0.875rem; margin-top: 20px;">
                    ※通知設定は公開ページの管理画面から変更できます。
                </p>
            </div>
        `;

        const msg = {
            to,
            from: {
                email: process.env.SENDGRID_FROM_EMAIL,
                name: 'Setlink(セトリンク)'
            },
            subject: '【Setlink】新しいリクエストが届きました',
            html: htmlContent,
        };

        await sgMail.send(msg);
        res.status(200).json({ message: '通知メールを送信しました。' });
    } catch (error) {
        console.error('メール送信エラー:', error);
        res.status(500).json({ message: 'メールの送信に失敗しました。', error: error.message });
    }
} 