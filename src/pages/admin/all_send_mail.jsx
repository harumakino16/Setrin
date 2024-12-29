import { useState } from 'react';
import { Box, Button, FormControl, InputLabel, MenuItem, Select, TextField, Typography, FormControlLabel, Switch } from '@mui/material';
import { Editor } from '@tinymce/tinymce-react';
import Layout from '@/pages/layout';
import withAdminAuth from '@/components/withAdminAuth';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { db } from '@/../firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';

const AllSendMail = () => {
    const [mailData, setMailData] = useState({
        subject: '',
        mailType: '',
        content: '',
        searchConditions: {
            campaignMailReceive: false,
            lastActivityDaysFrom: null,
            lastActivityDaysTo: null,
            userStatus: 'all',
        }
    });

    const mailTypes = [
        { value: 'campaign', label: 'キャンペーンメール' },
        { value: 'update', label: 'アップデートのお知らせ' },
        { value: 'survey', label: 'アンケート' },
        { value: 'news', label: 'ニュースレター' }
    ];

    const handleEditorChange = (content, editor) => {
        setMailData(prev => ({
            ...prev,
            content: content  // TinyMCEエディタから直接HTMLを取得
        }));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setMailData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const getFilteredUsers = async () => {
        const usersRef = collection(db, 'users');
        let q = query(usersRef);

        const { searchConditions } = mailData;

        // キャンペーンメール受信許可フィルター
        if (searchConditions.campaignMailReceive) {
            q = query(q, where('campaignMailReceive', '==', true));
        }

        // 会員ステータスフィルター
        if (searchConditions.userStatus !== 'all') {
            q = query(q, where('status', '==', searchConditions.userStatus));
        }

        const snapshot = await getDocs(q);
        const users = [];
        
        snapshot.forEach(doc => {
            const userData = doc.data();
            const lastActivity = userData.lastActivityAt?.toDate();
            
            // 最終アクティビティの日付フィルター
            let includeUser = true;
            const today = new Date();
            
            if (searchConditions.lastActivityDaysFrom) {
                const fromDate = new Date(today.getTime() - (searchConditions.lastActivityDaysFrom * 24 * 60 * 60 * 1000));
                if (lastActivity > fromDate) includeUser = false;
            }
            
            if (searchConditions.lastActivityDaysTo) {
                const toDate = new Date(today.getTime() - (searchConditions.lastActivityDaysTo * 24 * 60 * 60 * 1000));
                if (lastActivity < toDate) includeUser = false;
            }

            if (includeUser && userData.email) {
                users.push(userData.email);
            }
        });

        return users;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const emailAddresses = await getFilteredUsers();

            if (emailAddresses.length === 0) {
                alert('送信対象のユーザーが見つかりませんでした。');
                return;
            }

            console.log('Sending subject:', mailData.subject); // デバッグ用

            const response = await fetch('/api/send-bulk-mail', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    subject: mailData.subject,
                    content: mailData.content,
                    emailAddresses
                }),
            });

            if (response.ok) {
                alert(`${emailAddresses.length}件のメールの送信を開始しました`);
                setMailData({
                    subject: '',
                    mailType: '',
                    content: '',
                    searchConditions: {
                        campaignMailReceive: false,
                        lastActivityDaysFrom: null,
                        lastActivityDaysTo: null,
                        userStatus: 'all',
                    }
                });
            } else {
                throw new Error('メール送信に失敗しました');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('エラーが発生しました: ' + error.message);
        }
    };

    const renderSearchConditions = () => (
        <Box sx={{ mt: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
                送信対象ユーザーの条件
            </Typography>
            
            <FormControl component="fieldset" sx={{ mt: 2 }}>
                <FormControlLabel
                    control={
                        <Switch
                            checked={mailData.searchConditions.campaignMailReceive}
                            onChange={(e) => handleSearchConditionChange('campaignMailReceive', e.target.checked)}
                        />
                    }
                    label="キャンペーンメール受信許可ユーザーのみ"
                />
            </FormControl>

            <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                <TextField
                    type="number"
                    label="最終アクティビティ（○日以前）"
                    value={mailData.searchConditions.lastActivityDaysFrom || ''}
                    onChange={(e) => handleSearchConditionChange('lastActivityDaysFrom', e.target.value)}
                    fullWidth
                    helperText="空欄の場合は制限なし"
                />
                <TextField
                    type="number"
                    label="最終アクティビティ（○日以内）"
                    value={mailData.searchConditions.lastActivityDaysTo || ''}
                    onChange={(e) => handleSearchConditionChange('lastActivityDaysTo', e.target.value)}
                    fullWidth
                    helperText="空欄の場合は制限なし"
                />
            </Box>

            <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>会員ステータス</InputLabel>
                <Select
                    value={mailData.searchConditions.userStatus}
                    onChange={(e) => handleSearchConditionChange('userStatus', e.target.value)}
                    label="会員ステータス"
                >
                    <MenuItem value="all">すべて</MenuItem>
                    <MenuItem value="free">フリー会員</MenuItem>
                    <MenuItem value="premium">プレミアム会員</MenuItem>
                </Select>
            </FormControl>
        </Box>
    );

    const handleSearchConditionChange = (field, value) => {
        setMailData(prev => ({
            ...prev,
            searchConditions: {
                ...prev.searchConditions,
                [field]: value
            }
        }));
    };

    return (
        <Layout>
            <Box sx={{ maxWidth: 800, margin: '0 auto', padding: 3 }}>
                <Typography variant="h4" gutterBottom>
                    一括メール送信
                </Typography>

                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        label="件名"
                        name="subject"
                        value={mailData.subject}
                        onChange={handleInputChange}
                        margin="normal"
                        required
                    />

                    <FormControl fullWidth margin="normal" required>
                        <InputLabel>メールの種類</InputLabel>
                        <Select
                            name="mailType"
                            value={mailData.mailType}
                            onChange={handleInputChange}
                            label="メールの種類"
                        >
                            {mailTypes.map((type) => (
                                <MenuItem key={type.value} value={type.value}>
                                    {type.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Box sx={{ mt: 2, mb: 2 }}>
                        <Editor
                            apiKey={process.env.NEXT_PUBLIC_TINYMCE_KEY}
                            init={{
                                height: 500,
                                menubar: true,
                                plugins: [
                                    'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                                    'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                                    'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                                ],
                                toolbar: 'undo redo | blocks | ' +
                                    'bold italic forecolor | alignleft aligncenter ' +
                                    'alignright alignjustify | bullist numlist outdent indent | ' +
                                    'removeformat | help',
                                content_style: 'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; font-size: 14px; }',
                            }}
                            value={mailData.content}
                            onEditorChange={handleEditorChange}
                        />
                    </Box>

                    {renderSearchConditions()}

                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        size="large"
                        fullWidth
                        sx={{ mt: 2 }}
                    >
                        送信する
                    </Button>
                </form>
            </Box>
        </Layout>
    );
};

export default withAdminAuth(AllSendMail);

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}