const admin = require('firebase-admin');
const serviceAccount = JSON.parse(process.env.google_credentials)

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREDATABASE_URL 
});

module.exports = admin;

