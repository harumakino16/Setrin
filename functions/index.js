const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

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

