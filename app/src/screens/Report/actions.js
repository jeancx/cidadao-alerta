import MessagesAction from 'components/Messages/actions'
import { changeReportStatistics } from 'screens/Timeline/actions'
import bugsnagClient, { buildError, notifyUser } from 'services/bugsnag'
import { getSubcollectionRef } from 'services/firebase/firestore'
import { buildReportCommentSchema } from 'services/firebase/schemas/report'

export function loadReportComments (report) {
  return async dispatch => {
    try {
      const commentsRef = getSubcollectionRef('reports', report.id, 'comments')
      const docsSnapshot = await commentsRef.orderBy('createdAt', 'desc').get()
      const comments = []
      await docsSnapshot.docs.forEach(async (doc) => {
        const comment = { id: doc.id, ...await doc.data() }
        comment.author.prefecture ? comments.unshift(comment) : comments.push(comment)
      })

      dispatch({ type: 'REPORT_CHANGE', data: { report: { ...report, comments } } })
    } catch (error) {
      notifyUser()
      bugsnagClient.notify(error, buildError('info', 'loadReportComments', { report }))
    }
  }
}

export function addComment (report, comment, user) {
  return async dispatch => {
    await MessagesAction(dispatch, 'loading', true)

    try {
      const commentsRef = getSubcollectionRef('reports', report.id, 'comments')
      const docRef = await commentsRef.add(buildReportCommentSchema({ text: comment }, user))
      const savedComment = await docRef.get()

      await dispatch(changeReportStatistics(report.id, 'comment', +1, user))

      await dispatch({
        type: 'REPORT_CHANGE',
        data: { report: { ...report, comments: [...report.comments, { id: docRef.id, ...await savedComment.data() }] } }
      })
    } catch (error) {
      notifyUser()
      bugsnagClient.notify(error, buildError('info', 'addComment', { report, comment }, user))
    }

    MessagesAction(dispatch, 'loading', false)
  }
}

export function updateComment (comment, report, user) {
  return async dispatch => {
    await MessagesAction(dispatch, 'loading', true)

    try {
      const commentRef = getSubcollectionRef('reports', report.id, 'comments').doc(comment.id)
      const commentUpdated = buildReportCommentSchema(comment, user)
      await commentRef.update(commentUpdated)
      await dispatch({
        type: 'REPORT_CHANGE',
        data: {
          report: {
            ...report,
            comments: report.comments.map(c => c.id === commentUpdated.id ? commentUpdated : c)
          }
        }
      })
    } catch (error) {
      notifyUser()
      bugsnagClient.notify(error, buildError('info', 'addComment', { report, comment }, user))
    }

    MessagesAction(dispatch, 'loading', false)
  }
}

export function deleteComment (reportId, commentId, user) {
  return async dispatch => {
    MessagesAction(dispatch, 'loading', true)

    try {
      const commentRef = getSubcollectionRef('reports', reportId, 'comments').doc(commentId)
      const commentDoc = await commentRef.get()
      const commentData = await { id: commentDoc.id, ...await commentDoc.data() }

      if (commentData.author.uid === user.uid) {
        await commentRef.delete()
        await dispatch({ type: 'REPORT_COMMENT_DELETE', data: { reportId, commentId } })

        await dispatch(changeReportStatistics(reportId, 'comment', -1, user))
      }
    } catch (error) {
      notifyUser()
      bugsnagClient.notify(error, buildError('info', 'deleteComment', { reportId, commentId }, user))
    }

    MessagesAction(dispatch, 'loading', false)
  }
}

