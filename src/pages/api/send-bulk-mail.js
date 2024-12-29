import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { subject, content, emailAddresses } = req.body;

        // 各メールアドレスに個別にメールを送信
        const messages = emailAddresses.map(email => ({
            to: email,
            from: {
                email: process.env.SENDGRID_FROM_EMAIL,
                name: 'Setlink(セトリンク)'
            },
            subject: subject,  // メール自体の件名
            templateId: 'd-5934fea4d0af4b6699d5013b91f20662',
            dynamicTemplateData: {
                email_subject: subject,  // テンプレート内での件名変数
                subject: subject,        // 互換性のために残す
                body: content
            }
        }));

        // SendGridを使用して一括送信
        await sgMail.send(messages);

        res.status(200).json({ message: 'Emails sent successfully' });
    } catch (error) {
        console.error('SendGrid Error:', error);
        console.error('Error details:', error.response?.body);
        res.status(500).json({ message: 'Failed to send emails', error: error.message });
    }
} 