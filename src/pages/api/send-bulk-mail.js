import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

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

        // SendGridの一括送信を使用
        await sgMail.send(messages);
        
        res.status(200).json({
            message: 'メールが送信されました。',
            sentCount: recipients.length
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