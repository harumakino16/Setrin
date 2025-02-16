const { onRequest } = require("firebase-functions/v2/https");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const admin = require("firebase-admin");
const functions = require('firebase-functions');

admin.initializeApp();

exports.resetMonthlyCount = onRequest(async (req, res) => {
  const db = admin.firestore();
  const usersRef = db.collection("users");
  const batchSize = 500;

  try {
    let lastDoc = null;
    let processedDocs = 0; // 更新されたドキュメント数を追跡

    while (true) {
      let query = usersRef.orderBy(admin.firestore.FieldPath.documentId()).limit(batchSize);

      if (lastDoc) {
        query = query.startAfter(lastDoc);
      }

      const snapshot = await query.get();

      if (snapshot.empty) {
        console.log("No more user documents to process.");
        break;
      }

      const batch = db.batch();

      snapshot.forEach((doc) => {
        batch.update(usersRef.doc(doc.id), {
          'userActivity.monthlyRandomSetlistCount': 0,
          'userActivity.monthlyPlaylistCreationCount': 0,
          'userActivity.monthlyRequestUtawakuCount': 0,
          'userActivity.monthlyRouletteCount': 0,
        });
        processedDocs++;
      });
      
      await batch.commit();
      console.log(`Processed batch of ${snapshot.docs.length} documents.`);
      lastDoc = snapshot.docs[snapshot.docs.length - 1];
    }

    console.log(`Successfully reset monthlyCount for ${processedDocs} users.`);
    res.status(200).send(`Successfully reset monthlyCount for ${processedDocs} users.`);
  } catch (error) {
    console.error("Error resetting monthlyCount:", error);
    res.status(500).send(`Error resetting monthlyCount: ${error.message}`);
  }
});

// スケジュール実行用
exports.aggregateKpiMetrics = onSchedule("0 0 * * *", async (event) => {
  await aggregateKpiMetricsLogic();
});

// HTTP リクエストで実行用
exports.aggregateKpiMetricsHttp = onRequest(async (req, res) => {
  try {
    await aggregateKpiMetricsLogic();
    res.status(200).send('KPI metrics aggregation completed successfully');
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send(`Error: ${error.message}`);
  }
});

// 実際の処理を行う関数
async function aggregateKpiMetricsLogic() {
  const db = admin.firestore();
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));

  try {
    // 1. 新規登録者数を集計
    const newUsersQuery = await db.collection('users')
      .where('createdAt', '>=', monthStart)
      .count()
      .get();
    const newUsersCount = newUsersQuery.data().count;

    // 2. 広告からの新規登録者数を集計
    const adUsersQuery = await db.collection('users')
      .where('createdAt', '>=', monthStart)
      .where('isAd', '==', true)
      .count()
      .get();
    const adUsersCount = adUsersQuery.data().count;

    // 3. MAUを集計
    const mauQuery = await db.collection('users')
      .where('lastActivityAt', '>=', thirtyDaysAgo)
      .count()
      .get();
    const mauCount = mauQuery.data().count;

    // 4. 有料会員数を集計
    const paidUsersQuery = await db.collection('users')
      .where('plan', '==', 'premium')
      .count()
      .get();
    const paidUsersCount = paidUsersQuery.data().count;

    // 5. 広告からの有料会員数を集計
    const adPaidUsersQuery = await db.collection('users')
      .where('isAd', '==', true)
      .where('plan', '==', 'premium')
      .count()
      .get();
    const adPaidUsersCount = adPaidUsersQuery.data().count;

    // 6. 登録ソース別の集計（広告とオーガニック）
    const signUpSources = ['twitter', 'google', 'youtube', 'direct'];
    const sourceMetrics = {
      ad: {
        total: adUsersCount,
        referrers: {}
      },
      organic: {}
    };
    
    // 広告経由のリファラー別集計
    for (const source of signUpSources) {
      const adSourceQuery = await db.collection('users')
        .where('createdAt', '>=', monthStart)
        .where('signUpSource', '==', source)
        .where('isAd', '==', true)
        .count()
        .get();
      sourceMetrics.ad.referrers[source] = adSourceQuery.data().count;
    }
    
    // オーガニック集計
    for (const source of signUpSources) {
      const sourceQuery = await db.collection('users')
        .where('createdAt', '>=', monthStart)
        .where('signUpSource', '==', source)
        .where('isAd', '==', false)
        .count()
        .get();
      sourceMetrics.organic[source] = sourceQuery.data().count;
    }

    // 集計データを作成
    const metricsData = {
      date: today,
      newUsers: newUsersCount,
      adUsers: adUsersCount,
      mau: mauCount,
      paidUsers: paidUsersCount,
      adPaidUsers: adPaidUsersCount,
      adConversionRate: adUsersCount > 0 ? (adPaidUsersCount / adUsersCount) * 100 : 0,
      signUpSources: sourceMetrics,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    // metricsコレクションに保存
    await db.collection('metrics').add(metricsData);

    // メール本文を作成
    const emailContent = `
【本日のKPI指標】${today.toLocaleDateString('ja-JP')}

■ ユーザー数
・新規登録者数（当月）: ${newUsersCount}名
・MAU: ${mauCount}名
・有料会員数(トータル): ${paidUsersCount}名

■ 広告効果
・広告からの新規登録者数（当月）: ${adUsersCount}名
・広告からの有料会員数(トータル): ${adPaidUsersCount}名
・広告からの有料会員化率: ${metricsData.adConversionRate.toFixed(1)}%

■ 登録ソース別集計
【広告経由】
・合計: ${sourceMetrics.ad.total}名
・Twitter広告: ${sourceMetrics.ad.referrers.twitter}名
・Google広告: ${sourceMetrics.ad.referrers.google}名
・YouTube広告: ${sourceMetrics.ad.referrers.youtube}名
・直接アクセス: ${sourceMetrics.ad.referrers.direct}名

【オーガニック】
・Twitter: ${sourceMetrics.organic.twitter}名
・Google: ${sourceMetrics.organic.google}名
・YouTube: ${sourceMetrics.organic.youtube}名
・直接アクセス: ${sourceMetrics.organic.direct}名


※ このメールは自動送信されています。
    `;

    // メール送信
    await admin.firestore().collection('mail').add({
      to: 'harumakino16@yahoo.co.jp',
      cc: ['koita@soundworksk.net'],
      message: {
        subject: `【Setlink KPIレポート】${today.toLocaleDateString('ja-JP')}の集計結果`,
        text: emailContent
      },
      from: 'Setlink <setlink.contact@gmail.com>'
    });


    console.log('KPI metrics aggregation and email sending completed successfully');
  } catch (error) {
    console.error('Error in aggregateKpiMetrics:', error);
    throw error;
  }
}

// 月次サマリーを生成して送信する関数
exports.generateMonthlySummary = onSchedule("0 0 1 * *", async (event) => { // 毎月1日の0時に実行
  const db = admin.firestore();
  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

  try {
    // 前月のデータを取得
    const metricsRef = db.collection('metrics');
    const monthlyQuery = metricsRef
      .where('date', '>=', lastMonth)
      .where('date', '<=', lastMonthEnd)
      .orderBy('date', 'asc');
    
    const monthlySnap = await monthlyQuery.get();
    const monthlyData = monthlySnap.docs.map(doc => doc.data());

    // 前年同月のデータを取得
    const lastYear = new Date(lastMonth);
    lastYear.setFullYear(lastYear.getFullYear() - 1);
    const lastYearEnd = new Date(lastMonthEnd);
    lastYearEnd.setFullYear(lastYearEnd.getFullYear() - 1);

    const yearlyQuery = metricsRef
      .where('date', '>=', lastYear)
      .where('date', '<=', lastYearEnd)
      .orderBy('date', 'asc');
    
    const yearlySnap = await yearlyQuery.get();
    const yearlyData = yearlySnap.docs.map(doc => doc.data());

    // サマリーデータを計算
    const monthlySummary = calculateMonthlySummary(monthlyData, yearlyData);

    // メール送信
    await admin.firestore().collection('mail').add({
      to: 'harumakino16@yahoo.co.jp',
      cc: ['koita@soundworksk.net'],
      message: {
        subject: `【月次レポート】${lastMonth.getFullYear()}年${lastMonth.getMonth() + 1}月のKPIサマリー`,
        text: generateMonthlyEmailContent(monthlySummary)
      },
      from: 'Setlink <setlink.contact@gmail.com>'
    });

    console.log('Monthly summary generated and sent successfully');
    return null;
  } catch (error) {
    console.error('Error generating monthly summary:', error);
    throw error;
  }
});

function calculateMonthlySummary(monthlyData, yearlyData) {
  // 月間の集計値を計算
  const currentMonth = {
    newUsers: monthlyData.reduce((sum, d) => sum + d.newUsers, 0),
    mau: monthlyData[monthlyData.length - 1]?.mau || 0,
    paidUsers: monthlyData[monthlyData.length - 1]?.paidUsers || 0,
    adConversionRate: monthlyData[monthlyData.length - 1]?.adConversionRate || 0
  };

  // 前年同月の値
  const lastYear = {
    newUsers: yearlyData.reduce((sum, d) => sum + d.newUsers, 0),
    mau: yearlyData[yearlyData.length - 1]?.mau || 0,
    paidUsers: yearlyData[yearlyData.length - 1]?.paidUsers || 0,
    adConversionRate: yearlyData[yearlyData.length - 1]?.adConversionRate || 0
  };

  return {
    current: currentMonth,
    lastYear: lastYear,
    growth: {
      newUsers: ((currentMonth.newUsers - lastYear.newUsers) / lastYear.newUsers * 100).toFixed(1),
      mau: ((currentMonth.mau - lastYear.mau) / lastYear.mau * 100).toFixed(1),
      paidUsers: ((currentMonth.paidUsers - lastYear.paidUsers) / lastYear.paidUsers * 100).toFixed(1),
      adConversionRate: (currentMonth.adConversionRate - lastYear.adConversionRate).toFixed(1)
    }
  };
}

function generateMonthlyEmailContent(summary) {
  return `
【月次KPIレポート】

■ 主要指標サマリー
1. 新規登録者数
   - 当月: ${summary.current.newUsers}名
   - 前年同月比: ${summary.growth.newUsers}%

2. MAU（月間アクティブユーザー）
   - 当月: ${summary.current.mau}名
   - 前年同月比: ${summary.growth.mau}%

3. 有料会員数
   - 当月: ${summary.current.paidUsers}名
   - 前年同月比: ${summary.growth.paidUsers}%

4. 広告からの有料会員化率
   - 当月: ${summary.current.adConversionRate}%
   - 前年同月比: ${summary.growth.adConversionRate}ポイント

■ 分析と改善提案
${generateAnalysisAndSuggestions(summary)}

※ このレポートは自動生成されています。
  `;
}

function generateAnalysisAndSuggestions(summary) {
  const analysis = [];

  if (summary.growth.newUsers > 0) {
    analysis.push(`・新規登録者数が前年同月比${summary.growth.newUsers}%増加しており、集客施策が効果を上げています。`);
  } else {
    analysis.push(`・新規登録者数が前年同月比${Math.abs(summary.growth.newUsers)}%減少しており、集客施策の見直しが必要です。`);
  }

  if (summary.growth.paidUsers > 0) {
    analysis.push(`・有料会員数が前年同月比${summary.growth.paidUsers}%増加しており、収益基盤が強化されています。`);
  } else {
    analysis.push(`・有料会員数の伸び悩みが見られるため、会員特典の強化を検討する必要があります。`);
  }

  return analysis.join('\n');
}

// リクエストモード無効化の実際の処理を行う関数
async function disableRequestModeLogic() {
  try {
    // フリープランユーザーを取得
    const usersSnapshot = await admin.firestore()
      .collection('users')
      .where('plan', '==', 'free')
      .get();

    const batch = admin.firestore().batch();
    const processedUsers = [];

    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      
      // ユーザーの公開ページを取得
      const publicPagesSnapshot = await admin.firestore()
        .collection('users')
        .doc(userId)
        .collection('publicPages')
        .get();

      // 各公開ページのrequestModeをfalseに設定
      publicPagesSnapshot.docs.forEach(pageDoc => {
        batch.update(pageDoc.ref, { requestMode: false });
      });

      processedUsers.push(userId);
    }

    // バッチ処理を実行
    await batch.commit();

    console.log(`Successfully disabled request mode for ${processedUsers.length} users`);
    return processedUsers.length;
  } catch (error) {
    console.error('Error disabling request mode:', error);
    throw error;
  }
}

// スケジュール実行用
exports.disableRequestModeForFreePlanUsers = onSchedule({
  schedule: '0 0 1 2 *',  // 2月1日の0:00に実行
  timeZone: 'Asia/Tokyo',
  retryCount: 3,
  memory: '256MiB'
}, async (event) => {
  try {
    // 2025年のみ実行
    const currentYear = new Date().getFullYear();
    if (currentYear !== 2025) {
      console.log('This function should only run in 2025');
      return null;
    }

    await disableRequestModeLogic();
    return null;
  } catch (error) {
    console.error('Error in scheduled disableRequestMode:', error);
    return null;
  }
});

// HTTPリクエストで実行用（テスト用）
exports.disableRequestModeHttp = onRequest({
  memory: '256MiB',
  timeoutSeconds: 120
}, async (req, res) => {
  try {
    const processedCount = await disableRequestModeLogic();
    res.status(200).send(`Successfully disabled request mode for ${processedCount} users`);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send(`Error disabling request mode: ${error.message}`);
  }
});

