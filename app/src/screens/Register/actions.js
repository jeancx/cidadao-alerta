import ErrorMessages from 'constants/errors'
import MessagesAction from 'components/Messages/actions'
import { auth } from 'services/firebase'
import { updateUserProfile } from 'services/firebase/auth'
import bugsnagClient, { buildError, notifyUser } from 'services/bugsnag'
import { fillProfileForm } from '../Profile/actions'

export function changeInput (name, value) {
  return dispatch => {
    dispatch({
      type: 'USER_CHANGE_AUTH_INPUT',
      data: { name, value }
    })
  }
}

export function register (form) {
  return async dispatch => {
    const showErrorMessage = (message) => MessagesAction(dispatch, 'error', ErrorMessages[message])

    try {
      if (!form.displayName) return showErrorMessage('missingDisplayName')
      if (!form.email) return showErrorMessage('missingEmail')
      if (!form.password) return showErrorMessage('missingPassword')
      if (form.passwordConf !== form.password) return showErrorMessage('passwordsDontMatch')

      await MessagesAction(dispatch, 'loading', true)
      await auth.createUserWithEmailAndPassword(form.email, form.password)
      const data = await auth.signInWithEmailAndPassword(form.email, form.password)
      data.user.sendEmailVerification()
      await updateUserProfile({ displayName: form.displayName })
      data.user.displayName = form.displayName
      dispatch({ type: 'FIREBASE_USER_UPDATE', data })
      dispatch(fillProfileForm())
    } catch (error) {
      if (error.code === 'auth/weak-password') return showErrorMessage('passwordTooWeak')
      if (error.code === 'auth/email-already-in-use') return showErrorMessage('emailDuplicated')

      notifyUser()
      bugsnagClient.notify(error,
        buildError('error', 'register', { displayName: form.displayName, email: form.email })
      )
    }

    MessagesAction(dispatch, 'loading', false)
  }
}
