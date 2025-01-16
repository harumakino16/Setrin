import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { to, subject, html, templateData } = req.body;

        if (!to || !subject || !html) {
            return res.status(400).json({ message: '宛先、件名、本文は必須です。' });
        }

        const msg = {
            to,
            from: {
                email: process.env.SENDGRID_FROM_EMAIL,
                name: 'Setlink(セトリンク)'
            },
            subject,
            templateId: 'd-2169d7b1070b4ea996fba6eb90af60a7',
            dynamic_template_data: {
                subject,
                content: html,
                ...templateData
            }
        };

        await sgMail.send(msg);
        res.status(200).json({ message: 'メールが送信されました。' });
    } catch (error) {
        console.error('メール送信エラー:', error);
        res.status(500).json({ message: 'メールの送信に失敗しました。', error: error.message });
    }
} 