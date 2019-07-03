import express from 'express';
import cors from 'cors';
import {admin, firestoreDB, functions} from '../services/firebase';
import {changeGamificationAction} from '../services/gamefication'
import {sendMail} from '../services/mailer';

const FieldValue = require('firebase-admin').firestore.FieldValue;
const app = express();
const main = express();

main.use(cors({origin: true}));
main.use('/v1', app);
main.use(express.json());

async function requestUser(req: any, response: any, next: any) {
    try {
        const apiKey = req.query.api_key;

        if (req.url === '/reports' && apiKey) {
            const snapshot = await firestoreDB.collection('prefectures').where('apiKey', '==', apiKey).get();

            if (snapshot.docs.length > 0) {
                const prefecture = snapshot.docs[0];
                const user = await firestoreDB.collection('users').doc(prefecture.id).get();
                const rolesSnapshot = await firestoreDB.collection('roles').doc(prefecture.id).get();
                const roles = rolesSnapshot.data();

                if (roles && roles.prefecture) {
                    req.user = {id: user.id, ...user.data(), roles, prefecture: prefecture.data()};
                }
            }
        }

        if (req.headers.authorization) {
            let token = req.headers.authorization;
            token = token.slice(7, token.length);

            const auth = await admin.auth().verifyIdToken(token);
            const user = await firestoreDB.collection('users').doc(auth.id).get();
            const rolesSnapshot = await firestoreDB.collection('roles').doc(auth.id).get();
            const roles = rolesSnapshot.data();

            if (roles && (roles.superadmin || roles.admin || roles.prefecture || roles.moderator)) {
                req.user = {id: user.id, ...user.data(), roles};
                console.log(req.user)
            }
        } else {
            return next('No token found');
        }
    } catch (e) {
        console.log(e)
    }
    return next()
}

async function verifyAuth(req: any, response: any, next: any) {
    try {
        const originIsAllowed = req.headers.origin && req.headers.origin.endsWith('cidadaoalerta.org');
        const isPrefecture = req.user && req.user.roles && req.user.roles.prefecture;
        let authenticated = false;
        let token = req.headers.authorization;
        if (token) {
            token = token.slice(7, token.length);
            const auth = await admin.auth().verifyIdToken(token);
            authenticated = !!auth.uid
        }

        if (originIsAllowed || isPrefecture || authenticated) return next()
    } catch (error) {
        return response.status(500).send(error);
    }

    return response.status(401).send({auth: false, message: 'Acesso negado!'});
}

app.use(requestUser);

app.get('/', (req, response) => {
    response.send('Cidadão Alerta - API');
});

app.get('/reports', verifyAuth, async (req, response) => {
    try {
        const updatedAt = req.query.updated_at;
        let query = firestoreDB.collection('reports').orderBy('updatedAt', 'desc');
        if (updatedAt) query = query.where('updatedAt', '>', updatedAt);

        // @ts-ignore
        const {user} = req;

        if (user && user.roles && user.roles.prefecture && user.prefecture && user.prefecture.city) {
            query.where('address.city', '==', user.prefecture.city)
        }

        if (user && user.roles && user.roles.moderator && user.address && user.address.city) {
            query.where('address.city', '==', user.address.city)
        }

        const items: any = [];
        const querySnapshot = await query.get();
        querySnapshot.forEach((doc: any) => items.push({id: doc.id, ...doc.data()}));

        response.json(items);
    } catch (error) {
        response.status(500).send(error);
    }
});

app.get('/reports/:id', verifyAuth, async (req, response) => {
    try {
        const id = req.params.id;

        if (!id) throw new Error('Obrigatório informar ID do relato.');

        const doc = await firestoreDB.collection('reports').doc(id).get();

        if (!doc.exists) response.status(404).send('Relato não encontrado.');

        response.json({id: doc.id, ...doc.data()});
    } catch (error) {
        response.status(500).send(error);
    }
});

app.post('/reports/:reportId/comments/:commentId', verifyAuth, async (req, response) => {
    try {
        const reportId = req.params.reportId;
        const commentId = req.params.commentId;
        const reason = req.body.reason;
        // @ts-ignore
        const {user} = req;

        if (!reportId && !commentId) throw new Error('Obrigatório informar ID do relato e comentário.');
        if (!reason) throw new Error('Obrigatório informar um motivo.');

        if (user.roles.superadmin && user.roles.admin) {
            const docRef = await firestoreDB.collection('reports').doc(reportId).collection('comments').doc(reportId);

            if (await docRef.update({deletedAt: FieldValue.serverTimestamp(), reason})) {
                // @ts-ignore
                await changeGamificationAction(doc.id, 'comment', -1, doc.data().author.userId);

                response.json({reportId, commentId, message: 'Excluído com sucesso'});
            } else {
                throw new Error('Erro ao excluir.');
            }
        }
    } catch (error) {
        response.status(500).send(error);
    }
});

app.post('/reports/:reportId/comments', verifyAuth, async (req, response) => {
    try {
        const reportId = req.params.reportId;
        const text = req.body.text;
        if (!reportId) throw new Error('Obrigatório informar ID do relato e comentário.');
        const collectionRef = await firestoreDB.collection('reports').doc(reportId).collection('comments');
        // @ts-ignore
        const {user} = req;
        const comment = {
            text,
            author: {
                prefectureId: user.prefecture.id,
                displayName: user.prefecture.displayName,
                photoURL: user.prefecture.photoURL,
                updatedAt: FieldValue.serverTimestamp()
            }
        };
        const docSaved = await collectionRef.add(comment);

        response.json({id: docSaved.id, ...comment});
    } catch (error) {
        response.status(500).send(error);
    }
});

app.delete('/reports/:reportId', verifyAuth, async (req, response) => {
    try {
        const reportId = req.params.reportId;
        const reason = req.body.reason;
        // @ts-ignore
        const {user} = req;

        if (!reportId) throw new Error('Obrigatório informar ID do relato.');
        if (!reason) throw new Error('Obrigatório informar um motivo.');

        if (user.roles.superadmin || user.roles.admin) {
            const docRef = await firestoreDB.collection('reports').doc(reportId).collection('comments').doc(reportId);
            await docRef.update({deletedAt: FieldValue.serverTimestamp(), reason});
            const doc = await docRef.get();

            // @ts-ignore
            await changeGamificationAction(doc.id, 'comment', -1, doc.data().author.userId);
            response.json({reportId, message: 'Excluído com sucesso'});
        }
    } catch (error) {
        response.status(500).send(error);
    }
});

app.post('/reports/:reportId/marks/:markId', verifyAuth, async (req, response) => {
    try {
        const reportId = req.params.reportId;
        const markId = req.params.markId;
        // @ts-ignore
        const {user} = req;

        if (!reportId && !markId) throw new Error('Obrigatório informar ID do relato e marcação.');

        if (user.roles.superadmin || user.roles.admin || user.roles.moderator) {
            const reportRef = await firestoreDB.collection('reports').doc(reportId);
            const markRef = await reportRef.collection('marks').doc(reportId);

            await reportRef.update({solvedAt: FieldValue.serverTimestamp()});
            const solvedMarks = await reportRef.collection('marks').where('type', '==', 'solved').get();

            if (user.roles.moderator && solvedMarks.docs.length > 5 || user.roles.superadmin || user.roles.admin) {
                await markRef.update({solvedAt: FieldValue.serverTimestamp()});
            } else {
                await markRef.update({awaitingApproval: FieldValue.serverTimestamp()})

                const report = await reportRef.get();
                await firestoreDB.collection('reports').doc(report.id).update({solvedAt: FieldValue.serverTimestamp()});
                const subject = 'A prefeitura resolveu seu relato.';
                // @ts-ignore
                const content = `Você tem 30 dias para aprovar ou rejeitar, caso contrário será aprovado automaticamente.<br/>Relato: ${report.data().description}`;
                // @ts-ignore
                const reportUser = await firestoreDB.collection('users').doc(report.data().userId).get();
                // @ts-ignore
                await sendMail(reportUser.data().email, subject, content);
            }

            // @ts-ignore
            await changeGamificationAction(doc.id, 'comment', -1, doc.data().author.userId);

            response.json({reportId, message: 'Marcação efetivada.'});
        }
    } catch (error) {
        response.status(500).send(error);
    }
});

export default functions.https.onRequest(main);