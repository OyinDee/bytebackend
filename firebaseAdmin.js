const admin = require('firebase-admin');
const serviceAccount = require('./byte-7735e-firebase-adminsdk-svaqw-6b24755bb7.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREDATABASE_URL 
});

module.exports = admin;
