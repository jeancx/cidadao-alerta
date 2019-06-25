import {firestoreDB, functions} from '../services/firebase'
import {sendMail} from '../services/mailer'
const pointsByAction = require('../services/gamefication/pointsByAction.json');
const FieldValue = require('firebase-admin').firestore.FieldValue;

const onReportMark = functions.firestore.document('/reports/{reportId}/marks/{markId}}')
    .onCreate(async (data, context) => {
        const reportRef = await firestoreDB.collection('reports').doc(context.params.reportId);
        const marks = await reportRef.collection('marks').get();
        let solvedPointsAndWeightCount = 0;
        let solvedCount = 0;

        //(Resolvidos * Peso Nível Usuário).
        marks.docs.forEach(async (mark) => {
            if (mark.data().type === 'solved') {
                solvedCount++;
                const user = await firestoreDB.collection('users').doc(mark.data().author.uid).get();
                // @ts-ignore
                solvedPointsAndWeightCount += pointsByAction['solved'][user.data().statistics.level - 1]
            }
        });

        if (solvedCount >= 5) {
            const report = await reportRef.get();
            const moderator = await firestoreDB.collection('users')
                .where('claims.moderator', '==', true)
                // @ts-ignore
                .where('address.city', '==', report.data().address.city)
                .get();

            if (moderator.docs.length > 0) {
                const subject = 'Há uma marcação de um relato aguardando aprovação.';
                // @ts-ignore
                const content = `Há uma marcação de um relato aguardando aprovação.<br/>Relato: ${report.data().description}`;

                await sendMail(moderator.docs[0].data().email, subject, content);
            }
        }

        if (solvedPointsAndWeightCount >= 20) {
            const solvedAt = FieldValue.serverTimestamp();
            await firestoreDB.collection('reports').doc(context.params.reportId).update({solvedAt})
        }
    });

export default {onReportMark}




