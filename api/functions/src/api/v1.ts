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

async function requestUser(req: any, resp: any, next: any) {
    try {
        let token = req.query.api_key || req.headers.authorization;
        if (token.startsWith('Bearer ')) token = token.slice(7, token.length);

        if (req.query.api_key || req.headers.authorization) {
            const decodedToken = await admin.auth().verifyIdToken(token);

            if (decodedToken.uid) {
                let prefecture = {};
                const auth = await admin.auth().getUser(decodedToken.uid);
                const user = await firestoreDB.collection('users').doc(auth.uid).get();
                const claims = auth.customClaims;

                // @ts-ignore
                if (claims && claims.prefecture) {
                    prefecture = await firestoreDB.collection('prefectures').doc(auth.uid).get();
                    // @ts-ignore
                    prefecture = prefecture.data();
                }

                // @ts-ignore
                if (claims && (claims.superAdmin || claims.admin || claims.prefecture || claims.moderator)) {
                    req.user = {...auth, user: user.data(), claims, prefecture};
                }
            }
        }
    } catch (e) {
        console.log(e)
    }
    return next()
}

async function verifyAuth(req: any, resp: any, next: any) {
    try {
        const originIsAllowed = req.headers.origin && req.headers.origin.endsWith('cidadaoalerta.org');
        const isPrefecture = req.user && req.user.claims && req.user.claims.prefecture;
        let authenticated = false;
        let token = req.headers.authorization;
        if (token) {
            token = token.slice(7, token.length);
            const auth = await admin.auth().verifyIdToken(token);
            authenticated = !!auth.uid
        }

        if (originIsAllowed || isPrefecture || authenticated) return next()
    } catch (error) {
        return resp.status(500).send(error);
    }

    return resp.status(401).send({auth: false, message: 'Acesso negado!'});
}

app.use(requestUser);

app.get('/', (req, resp) => {
    resp.send('Cidadão Alerta - API');
});

app.get('/reports', verifyAuth, async (req, resp) => {
    try {
        const updatedAt = req.query.updated_at;
        let query = firestoreDB.collection('reports').orderBy('updatedAt', 'desc');
        if (updatedAt) query = query.where('updatedAt', '>', updatedAt);

        // @ts-ignore
        const {user} = req;
        if (user && user.claims && (user.claims.prefecture || user.claims.moderator)) {
            query.where('address.city', '==', user.claims.city)
        }

        const items: any = [];
        const querySnapshot = await query.get();
        querySnapshot.forEach((doc: any) => items.push({id: doc.id, ...doc.data()}));

        resp.json(items);
    } catch (error) {
        resp.status(500).send(error);
    }
});

app.get('/reports/:id', verifyAuth, async (req, resp) => {
    try {
        const id = req.params.id;

        if (!id) throw new Error('Obrigatório informar ID do relato.');

        const doc = await firestoreDB.collection('reports').doc(id).get();

        if (!doc.exists) resp.status(404).send('Relato não encontrado.');

        resp.json({id: doc.id, ...doc.data()});
    } catch (error) {
        resp.status(500).send(error);
    }
});

app.delete('/reports/:reportId/comments/:commentId', verifyAuth, async (req, resp) => {
    try {
        const reportId = req.params.reportId;
        const commentId = req.params.commentId;
        const reason = req.body.reason;
        // @ts-ignore
        const {user} = req;

        if (!reportId && !commentId) throw new Error('Obrigatório informar ID do relato e comentário.');
        if (!reason) throw new Error('Obrigatório informar um motivo.');

        if (user.claims.superAdmin && user.claims.admin) {
            const docRef = await firestoreDB.collection('reports').doc(reportId).collection('comments').doc(reportId);

            if (await docRef.update({deletedAt: FieldValue.serverTimestamp(), reason})) {
                // @ts-ignore
                await changeGamificationAction(doc.id, 'falseComment', doc.data().author.userId);

                resp.json({reportId, commentId, message: 'Excluído com sucesso'});
            } else {
                throw new Error('Erro ao excluir.');
            }
        }
    } catch (error) {
        resp.status(500).send(error);
    }
});

app.post('/reports/:reportId/comments', verifyAuth, async (req, resp) => {
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
        await changeGamificationAction(docSaved.id, 'prefectureComment', user.prefecture.id);

        resp.json({id: docSaved.id, ...comment});
    } catch (error) {
        resp.status(500).send(error);
    }
});

app.delete('/reports/:reportId', verifyAuth, async (req, resp) => {
    try {
        const reportId = req.params.reportId;
        const reason = req.body.reason;
        // @ts-ignore
        const {user} = req;

        if (!reportId) throw new Error('Obrigatório informar ID do relato.');
        if (!reason) throw new Error('Obrigatório informar um motivo.');

        if (user.claims.superAdmin || user.claims.admin) {
            const docRef = await firestoreDB.collection('reports').doc(reportId).collection('comments').doc(reportId);
            await docRef.update({deletedAt: FieldValue.serverTimestamp(), reason});
            const doc = await docRef.get();

            // @ts-ignore
            await changeGamificationAction(doc.id, 'falseReport', doc.data().author.userId);
            resp.json({reportId, message: 'Excluído com sucesso'});
        }
    } catch (error) {
        resp.status(500).send(error);
    }
});

app.post('/reports/:reportId/marks/:markId', verifyAuth, async (req, resp) => {
    try {
        const reportId = req.params.reportId;
        const markId = req.params.markId;
        // @ts-ignore
        const {user} = req;

        if (!reportId && !markId) throw new Error('Obrigatório informar ID do relato e marcação.');

        if (user.claims.superAdmin || user.claims.admin || user.claims.moderator) {
            const reportRef = await firestoreDB.collection('reports').doc(reportId);
            const markRef = await reportRef.collection('marks').doc(reportId);

            await reportRef.update({solvedAt: FieldValue.serverTimestamp()});
            const solvedMarks = await reportRef.collection('marks').where('type', '==', 'solved').get();

            if (user.claims.moderator && solvedMarks.docs.length > 5 || user.claims.superAdmin || user.claims.admin) {
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
            await changeGamificationAction(doc.id, 'comment', doc.data().author.userId);

            resp.json({reportId, message: 'Marcação efetivada.'});
        }
    } catch (error) {
        resp.status(500).send(error);
    }
});

app.get('/users/:id/claims', verifyAuth, async (req, resp) => {
    try {
        const id = req.params.id;
        const claims = req.body;

        if (!id) throw new Error('Obrigatório informar ID do usuário.');

        // @ts-ignore
        if (req.user.claims.superAdmin || req.user.claims.admin) {
            let apiKey = '';
            const user = await admin.auth().getUser(id);

            // @ts-ignore
            if (user.customClaims && user.customClaims.superAdmin && !req.user.claims.superAdmin) {
                throw new Error('Você não tem permissão para relizar esta ação.');
            }
            if (claims.prefecture) apiKey = await admin.auth().createCustomToken(id);

            await admin.auth().setCustomUserClaims(id, {...user.customClaims, ...claims, apiKey})
        }
        resp.json(true);
    } catch (error) {
        resp.status(500).send(error);
    }
});

export default functions.https.onRequest(main);
