import * as pointsByAction from './gamefication/pointsByAction.json';
import * as pointsByLevel from './gamefication/trophies.json';
import {firestoreDB} from './firebase';

const trophies = require('./gamefication/trophies.json');

export async function changeGamificationAction(docId: string, action: string, userId: any) {
    try {
        const updateStatistics = (user: any) => {
            let statistics = user.statistics;
            const points = -1 * calcPointsByAction(action, statistics.level || 1);

            statistics[action] = statistics[action].filter((itemId: string) => itemId !== docId);
            statistics.experience = statistics.experience + points;
            statistics.level = calcLevel(statistics.experience);
            if (!user.customClaims.prefecture) statistics = trophiesService(user, statistics);
            return {statistics}
        };

        const userRef = firestoreDB.collection('users').doc(userId);
        return firestoreDB.runTransaction((transacion) => {
            return transacion.get(userRef).then(async (user: any) => {
                await transacion.update(userRef, updateStatistics(user));
            });
        })
    } catch (error) {
        console.log(error)
    }
}

async function trophiesService(user: any, statistics: any) {
    try {
        for (const trophy of trophies) {
            const newEarnedTrophy = statistics[trophy.type].length >= trophy.number;

            if (newEarnedTrophy) {
                let alreadyEarnedTrophy = false;

                for (const userTrophy of statistics.trophy) {
                    if (userTrophy.type === trophy.type && userTrophy.number === trophy.number) {
                        alreadyEarnedTrophy = true
                    }
                }

                if (!alreadyEarnedTrophy) {
                    statistics.trophy.push(trophy);
                    statistics['experience'] += trophy.points;
                    statistics['level'] = calcLevel(statistics['experience']);
                    await saveAction(user.uid, 'trophy', trophy.name, trophy.points)
                }
            }
        }
    } catch (error) {
        console.log(error)
    }

    return statistics
}

async function saveAction(userId: string, action: string, docId: string, points: number) {
    try {
        await firestoreDB.collection('prefectures').doc(userId).collection('actions')
            .add({type: action, userId: docId, createdAt: new Date(), points});
    } catch (error) {
        console.log(error)
    }
}

function calcLevel(experience: number) {
    // @ts-ignore
    return pointsByLevel.reduce((levelSum: number, level: any) => ((experience >= level.points) ? levelSum + 1 : levelSum), 0)
}

function calcPointsByAction(action: string, level = 1) {
    // @ts-ignore
    return pointsByAction[action].points * pointsByAction[action].multiplierByLevel[level - 1]
}
