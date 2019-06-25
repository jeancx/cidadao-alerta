import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

const firebase = admin.initializeApp(functions.config().firebase);
const firestoreDB = admin.firestore();

export { admin, functions, firebase, firestoreDB }
