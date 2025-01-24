import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// SendGridのタイムアウト設定を30秒に設定
sgMail.setTimeout(30000);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { recipients, templateId, templateData } = req.body;

        if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
            return res.status(400).json({ message: '送信先リストは必須です。' });
        }

        if (!templateId) {
            return res.status(400).json({ message: 'テンプレートIDは必須です。' });
        }

        // 送信先リストの検証
        const invalidEmails = recipients.filter(email => !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/));
        if (invalidEmails.length > 0) {
            return res.status(400).json({
                message: '無効なメールアドレスが含まれています。',
                invalidEmails
            });
        }

        // 各受信者へのメッセージを作成
        const messages = recipients.map(to => ({
            to,
            from: {
                email: process.env.SENDGRID_FROM_EMAIL,
                name: 'Setlink(セトリンク)'
            },
            template_id: templateId,
            dynamic_template_data: {
                subject: templateData.subject || 'Setlinkからのお知らせ',
                content: templateData.content,
                ...templateData
            }
        }));

        // メッセージを小さなチャンクに分割（SendGridの推奨は1000件以下）
        const chunkSize = 100;
        const messageChunks = [];
        for (let i = 0; i < messages.length; i += chunkSize) {
            messageChunks.push(messages.slice(i, i + chunkSize));
        }

        // 各チャンクを順番に処理
        let successCount = 0;
        let failedEmails = [];

        for (const chunk of messageChunks) {
            try {
                await sgMail.send(chunk);
                successCount += chunk.length;
                // APIレート制限対策
                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (error) {
                console.error('チャンク送信エラー:', error);
                if (error.response?.body?.errors) {
                    console.error('SendGrid エラー詳細:', error.response.body.errors);
                }
                // エラーが発生したチャンクのメールアドレスを記録
                failedEmails.push(...chunk.map(msg => msg.to));
            }
        }

        res.status(200).json({
            message: 'メール送信が完了しました。',
            successCount,
            failedCount: messages.length - successCount,
            failedEmails: failedEmails.length > 0 ? failedEmails : undefined
        });
    } catch (error) {
        console.error('一斉メール送信エラー:', error);
        if (error.response && error.response.body && error.response.body.errors) {
            console.error('SendGrid エラー詳細:', error.response.body.errors);
        }
        res.status(500).json({
            message: 'メールの送信に失敗しました。',
            error: error.message
        });
    }
} 