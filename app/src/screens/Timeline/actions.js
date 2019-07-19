import MessagesAction from 'components/Messages/actions'
import { get } from 'geofirex'
import { Share } from 'react-native'
import bugsnagClient, { buildError, notifyUser } from 'services/bugsnag'
import { geo } from 'services/firebase'
import { getUserProfile } from 'services/firebase/auth'
import {
  fetchCollectionAsync, fetchDocAsync, fetchSubcolectionAsync, getDocRef, getSubcollectionRef, updateDocTransactionAsync
} from 'services/firebase/firestore'
import {
  buildReportActionSchema, buildReportMarkSchema, buildReportStatisticsSchema
} from 'services/firebase/schemas/report'
import uploadImageAsync from 'services/firebase/storage'
import changeGamificationAction from 'services/gamefication'
import getCurrentLocation from 'services/location'

function sortByName (array) {
  return array.sort((a, b) => (a.name).localeCompare(b.name, 'en', { sensitivity: 'base' }))
}

export function fetchCategories () {
  return async dispatch => {
    try {
      const categories = await sortByName(await fetchCollectionAsync('categories'))

      categories.forEach(async (_, index) => {
        categories[index].subcategories = await sortByName(
          await fetchSubcolectionAsync('categories', categories[index].id, 'subcategories')
        )
      })

      dispatch({
        type: 'CATEGORIES_UPDATE',
        data: { categories }
      })
    } catch (error) {
      notifyUser()
      bugsnagClient.notify(error, buildError('info', 'fetchCategories'))
    }
  }
}

function calculateDistance (lat1, lat2, lon1, lon2) {
  if ((lat1 === lat2) && (lon1 === lon2)) {
    return 0
  }

  const radLat1 = Math.PI * lat1 / 180
  const radLat2 = Math.PI * lat2 / 180
  const theta = lon1 - lon2
  const radTheta = Math.PI * theta / 180
  let distance = Math.sin(radLat1) * Math.sin(radLat2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.cos(radTheta)
  distance = Math.acos(distance > 1 ? 1 : distance)
  distance = distance * 180 / Math.PI
  distance = distance * 60 * 1.1515

  return distance * 1.609344
}

export function resetLoading () {
  return dispatch => {
    MessagesAction(dispatch, 'loading', false)
  }
}

export function fetchUser (user) {
  return async dispatch => {
    const { uid } = user
    dispatch({ type: 'USER_CHANGE_PROFILE', data: { profile: await getUserProfile(uid) } })
  }
}

export function fetchNearReports () {
  return async dispatch => {
    try {
      const userLocation = await getCurrentLocation()
      const reportsRef = geo.collection('reports')
      const query = reportsRef.within(geo.point(userLocation.latitude, userLocation.longitude), 50, 'location')
      const reports = await get(query)

      reports.forEach((_, index) => {
        reports[index].distance = calculateDistance(
          reports[index].location.geopoint._lat, userLocation.latitude,
          reports[index].location.geopoint._long, userLocation.longitude
        )
      })

      dispatch({
        type: 'REPORTS_UPDATE',
        data: { reports: reports.sort((a, b) => a.createdAt.seconds < b.createdAt.seconds) }
      })
    } catch (error) {
      notifyUser()
      bugsnagClient.notify(error, buildError('info', 'fetchNearReports'))
    }
  }
}

export function changeReportStatistics (docId, action, number, user) {
  return async dispatch => {
    try {
      await dispatch(changeGamificationAction(docId, action, number, user))
      const updateStatistics = report => {
        const statistics = buildReportStatisticsSchema(report.statistics)
        const counterSum = (statistics[action] += number) || number
        statistics[action] = counterSum > -1 ? counterSum : 0
        return { statistics }
      }
      const updatedReport = await updateDocTransactionAsync('reports', docId, updateStatistics)
      await dispatch({ type: 'REPORT_CHANGE', data: { report: updatedReport } })
    } catch (error) {
      bugsnagClient.notify(error,
        buildError('error', 'changeReportStatistics', { docId, action, number }, user)
      )
    }
  }
}

export function shareReport (report, user) {
  return async dispatch => {
    try {
      const url = `https://cidadaoalerta.org/?id=${report.id}`
      const message = `${report.description.trim()}\n${url}`
      const content = {
        title: 'Cidadão Alerta', message, url, subject: 'Cidadão Alerta'
      }
      const shareResult = await Share.share(content)
      const action = 'share'

      if (shareResult.action === Share.sharedAction) {
        const reportActionsRef = getSubcollectionRef('reports', report.id, 'actions')
        const docsSnapshot = await reportActionsRef
          .where('userId', '==', user.uid)
          .where('type', '==', action)
          .get()

        if (docsSnapshot.docs.length <= 0) {
          dispatch(changeReportStatistics(report.id, action, +1, user))
          reportActionsRef.add(buildReportActionSchema(action, user))
        }
      }
    } catch (error) {
      bugsnagClient.notify(error, buildError('error', 'shareReport', report, user))
    }
  }
}

export function deleteReport (reportId, userId) {
  return async dispatch => {
    MessagesAction(dispatch, 'loading', true)

    try {
      const reportData = await fetchDocAsync('reports', reportId)

      if (reportData.author.uid === userId) {
        await getDocRef('reports', reportId).delete()
        await dispatch({ type: 'REPORT_DELETE', data: { reportId } })
      }
    } catch (error) {
      notifyUser()
      bugsnagClient.notify(
        error, buildError('error', 'deleteReport', { reportId }, { userId })
      )
    }

    MessagesAction(dispatch, 'loading', false)
  }
}

export function answerReport (reportId) {
  return async dispatch => {
    dispatch({ type: 'REPORTS_ANSWERS_UPDATE', data: { reportId } })
  }
}

export function reportActionTypeChange (docId, action, user) {
  return async dispatch => {
    try {
      const reportActionsRef = getSubcollectionRef('reports', docId, 'actions')
      const docsSnapshot = await reportActionsRef
        .where('userId', '==', user.uid)
        .where('type', '==', action)
        .get()

      if (docsSnapshot.docs.length > 0) {
        dispatch(changeReportStatistics(docId, action, docsSnapshot.docs.length * -1, user))

        docsSnapshot.docs.map(doc => reportActionsRef.doc(doc.id).delete())
      } else {
        dispatch(changeReportStatistics(docId, action, 1, user))
        reportActionsRef.add(buildReportActionSchema(action, user))
      }
    } catch (error) {
      bugsnagClient.notify(
        error, buildError('error', 'reportActionTypeChange', { docId, action, user })
      )
    }
  }
}

export function saveMarkOnReport (type, report, model, user) {
  return async dispatch => {
    try {
      const newModel = { ...model }
      const reportMarksRef = getSubcollectionRef('reports', report.id, 'marks')
      const docsSnapshot = await reportMarksRef
        .where('type', '==', type)
        .where('userId', '==', user.uid)
        .get()

      if (newModel.pictures && newModel.pictures.length > 0) {
        const folder = `reports/${report.id}/${type}`
        newModel.pictures = await Promise.all([...newModel.pictures].map(async (picture, index) => (
          uploadImageAsync(picture, folder, `${index}.jpg`)
        )))
      }

      if (type === 'solved') {
        answerReport(report.id)
      }

      if (docsSnapshot.docs.length <= 0) {
        await dispatch(changeReportStatistics(report.id, type, 1, user))
        await dispatch(reportActionTypeChange(report.id, type, user))
        await reportMarksRef.add(buildReportMarkSchema(type, newModel, user))
      }
    } catch (error) {
      notifyUser()
      bugsnagClient.notify(
        error, buildError('error', 'saveMarkOnReport', { type, report, model }, user)
      )
    }
  }
}
