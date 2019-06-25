import {firestoreDB, functions} from '../services/firebase'
import {sendMail} from '../services/mailer';
const FieldValue = require('firebase-admin').firestore.FieldValue;

export const markSolvedAfter30Days = functions.pubsub.schedule('0 3 * * *')
    .timeZone('America/Sao_Paulo') // Users can choose timezone - default is UTC
    .onRun(async () => {
        const startDate = new Date().setDate(new Date().getDate() - 30);
        const reports = await firestoreDB.collection('reports').where('awaitingApproval', '<=', startDate).get();

        reports.docs.forEach(async (report) => {
            await firestoreDB.collection('reports').doc(report.id).update({solvedAt: FieldValue.serverTimestamp()});

            const subject = 'A marcação de resolução  do relato foi aprovado automaticamente';
            // @ts-ignore
            const content = `A marcação de resolução  do relato foi aprovado automaticamente, pois se passou 30 dias.<br/>Relato: ${report.data().description}`;
            const user = await firestoreDB.collection('users').doc(report.data().userId).get();
            // @ts-ignore
            await sendMail(user.data().email, subject, content);
        })
    });


export default { markSolvedAfter30Days }