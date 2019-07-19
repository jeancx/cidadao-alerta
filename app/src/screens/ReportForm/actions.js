import MessagesAction from 'components/Messages/actions'
import { reportActionTypeChange } from 'screens/Timeline/actions'
import bugsnagClient, { buildError, notifyUser } from 'services/bugsnag'
import { fetchDocAsync, getCollectionRef } from 'services/firebase/firestore'
import { geo } from 'services/firebase'
import buildReportSchema from 'services/firebase/schemas/report'
import uploadImageAsync from 'services/firebase/storage'

export function loadForm (report) {
  return async dispatch => {
    await MessagesAction(dispatch, 'loading', true)

    try {
      const reportDoc = await fetchDocAsync('reports', report.id)

      dispatch({ type: 'REPORT_FORM_LOAD', data: { report: reportDoc || report } })
    } catch (error) {
      notifyUser()
      bugsnagClient.notify(error, buildError('info', 'loadForm', { report }))
    }

    await MessagesAction(dispatch, 'loading', false)
  }
}

export function resetForm () {
  return dispatch => dispatch({ type: 'REPORT_FORM_RESET' })
}

export function addErrorMessage (message) {
  return dispatch => MessagesAction(dispatch, 'error', message)
}

export function addPicture (picture) {
  return dispatch => dispatch({ type: 'REPORT_FORM_ADD_PICTURE', data: { picture } })
}

export function removePicture (picture) {
  return dispatch => dispatch({ type: 'REPORT_FORM_REMOVE_PICTURE', data: { picture } })
}

export function changeLocation (geolocation, address, snapshot = '') {
  return dispatch => dispatch({ type: 'REPORT_FORM_CHANGE_LOCATION', data: { geolocation, address, snapshot } })
}

export function changeInput (name, value) {
  return dispatch => dispatch({ type: 'REPORT_FORM_CHANGE_INPUT', data: { name, value } })
}

export function save (report, user) {
  return async dispatch => {
    await MessagesAction(dispatch, 'loading', true)

    try {
      const reportsRef = getCollectionRef('reports')
      let docRef
      const reportSchema = buildReportSchema({ ...report, pictures: [] }, user)
      const editReport = report.id ? true : false

      if (editReport) {
        if (report.userId !== user.uid) return false

        docRef = reportsRef.doc(report.id)
        await docRef.update(reportSchema)
      } else {
        docRef = await reportsRef.add(reportSchema)
      }

      const geolocation = reportSchema.geolocation
      geo.collection('reports').setPoint(docRef.id, 'location', geolocation._lat, geolocation._long)

      const folder = `reports/${docRef.id}`
      const pictures = await Promise.all([...report.pictures].map(async (picture, index) => {
        return await uploadImageAsync(picture, folder, `${index}.jpg`)
      }))

      docRef.update({ pictures, active: true })
      await dispatch({ type: 'REPORT_FORM_RESET' })

      const savedReport = await docRef.get()

      if (editReport) {
        await dispatch({
          type: 'REPORT_CHANGE',
          data: { report: { id: savedReport.id, ...await savedReport.data(), pictures, active: true } }
        })
      } else {
        await dispatch(reportActionTypeChange(savedReport.id, 'report', user))
        await dispatch({
          type: 'REPORT_PREPEND',
          data: { report: { id: savedReport.id, ...await savedReport.data(), pictures, active: true } }
        })
      }
    } catch (error) {
      notifyUser()
      bugsnagClient.notify(error, buildError('info', 'save', { report }, user))
    }

    MessagesAction(dispatch, 'loading', false)
  }
}
