import { getSubcollectionRef, updateDocTransactionAsync } from 'services/firebase/firestore'
import { buildUserActionSchema, buildUserStatisticsSchema } from './firebase/schemas/user'
import pointsByAction from './gamefication/pointsByAction.json'
import pointsByLevel from './gamefication/pointsByLevel.json'
import trophies from './gamefication/trophies'
import bugsnagClient, { buildError, notifyUser } from 'services/bugsnag'
import { ToastAndroid } from 'react-native'
import { DropDownHolder } from 'components/DropdownHolder'

export function changeGamificationAction (docId, action, number, user) {
  return async dispatch => {
    try {
      const points = number * calcPointsByAction(action, user.profile.level || 1)
      const updateStatistics = user => {
        let statistics = buildUserStatisticsSchema(user.statistics)

        number > 0
          ? statistics[action].push(docId)
          : statistics[action] = statistics[action].filter(itemId => itemId !== docId)

        statistics.experience = statistics.experience + points

        const newLevel = calcLevel(statistics.experience)

        if (newLevel > statistics.level) {
          const message = `Parabens você subiu de nível e agora tem: ${pointsByLevel[newLevel].benefits}`
          DropDownHolder.alert('success', 'Subiu de nível', message)
        }

        statistics.level = newLevel
        statistics = trophiesService(user, statistics)
        return { statistics }
      }

      if (buildUserStatisticsSchema(user.statistics)[action].indexOf(docId) === -1) {
        const updatedProfile = await updateDocTransactionAsync('users', user.uid, updateStatistics)
        await saveAction(user.uid, action, docId, points)
        await dispatch({ type: 'USER_CHANGE_PROFILE', data: { profile: updatedProfile } })
      }
    } catch (error) {
      notifyUser()
      bugsnagClient.notify(
        error, buildError('info', 'changeGamificationAction', { docId, action, number }, user)
      )
    }
  }
}

function trophiesService (user, statistics) {
  try {
    for (const trophy of trophies) {
      const newEarnedTrophy = statistics[trophy.type].length >= trophy.number

      if (newEarnedTrophy) {
        let alreadyEarnedTrophy = false

        for (const userTrophy of statistics.trophy) {
          if (userTrophy.type === trophy.type && userTrophy.number === trophy.number) {
            alreadyEarnedTrophy = true
          }
        }

        if (!alreadyEarnedTrophy) {
          statistics.trophy.push(trophy)
          statistics['experience'] += trophy.points
          statistics['level'] = calcLevel(statistics['experience'])

          const message = `Parabens você alcaçou a conquista: ${trophy.name}`
          DropDownHolder.alert('success', 'Conquista Desbloqueada', message)

          saveAction(user.uid, 'trophy', trophy.name, trophy.points)
        }
      }
    }
  } catch (error) {
    notifyUser()
    bugsnagClient.notify(error, buildError('error', 'trophiesService', { statistics }, user))
  }

  return statistics
}

function saveAction (userId, action, docId, points) {
  try {
    ToastAndroid.show(`${points > 0 ? '+' : ''}${points} XP`, ToastAndroid.SHORT)
    const actionsRef = getSubcollectionRef('users', userId, 'actions')
    actionsRef.add(buildUserActionSchema(action, docId, points))
  } catch (error) {
    notifyUser()
    bugsnagClient.notify(
      error, buildError('error', 'saveAction', { userId, action, docId, points })
    )
  }
}

function calcLevel (experience) {
  return pointsByLevel.reduce((levelSum, level) => ((experience >= level.points) ? levelSum + 1 : levelSum), 0)
}

function calcPointsByAction (action, level = 1) {
  return pointsByAction[action].points * pointsByAction[action].multiplierByLevel[level - 1]
}
