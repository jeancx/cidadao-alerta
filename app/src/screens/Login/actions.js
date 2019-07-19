import MessagesAction from 'components/Messages/actions'
import ErrorMessages from 'constants/errors'
import { Facebook, GoogleSignIn } from 'expo'
import bugsnagClient, { buildError, notifyUser } from 'services/bugsnag'
import { auth, firebase } from 'services/firebase'

export function resetLoading () {
  return dispatch => MessagesAction(dispatch, 'loading', false)
}

export function changeInput (name, value) {
  return dispatch => dispatch({ type: 'USER_CHANGE_AUTH_INPUT', data: { name, value } })
}

export function authenticate (email, password) {
  return async dispatch => {
    await MessagesAction(dispatch, 'loading', true)

    try {
      if (!email) return MessagesAction(dispatch, 'error', ErrorMessages.missingEmail)
      if (!password) return MessagesAction(dispatch, 'error', ErrorMessages.missingPassword)

      const data = await auth.signInWithEmailAndPassword(email, password)
      dispatch({ type: 'FIREBASE_USER_UPDATE', data })
    } catch (error) {
      notifyUser()
      bugsnagClient.notify(error, buildError('error', 'authenticate', { email }))
    }

    return MessagesAction(dispatch, 'loading', false)
  }
}

export function facebookLogin () {
  return async dispatch => {
    try {
      const permissions = { permissions: ['public_profile', 'email'] }
      const { type, token } = await Facebook.logInWithReadPermissionsAsync('1621776977922757', permissions)

      if (type === 'success') {
        const credential = firebase.auth.FacebookAuthProvider.credential(token)
        const facebook = await auth.signInAndRetrieveDataWithCredential(credential)

        dispatch({ type: 'FIREBASE_USER_UPDATE', data: { user: facebook.user } })
      }
    } catch (error) {
      notifyUser()
      bugsnagClient.notify(error, buildError('error', 'facebookLogin'))
    }
  }
}

export function googleLogin () {
  return async dispatch => {
    try {
      const clientId = 'CLIENT_ID'
      await GoogleSignIn.initAsync({ clientId })
      await GoogleSignIn.askForPlayServicesAsync()
      const { type, user } = await GoogleSignIn.signInAsync()

      if (type === 'success') {
        const credential = firebase.auth.GoogleAuthProvider.credential(user.auth.idToken, user.auth.accessToken)
        const google = await auth.signInAndRetrieveDataWithCredential(credential)

        dispatch({ type: 'FIREBASE_USER_UPDATE', data: { user: google.user } })
      }
    } catch (error) {
      if (error.code === 'auth/weak-password') return MessagesAction(dispatch, 'error', ErrorMessages.passwordTooWeak)
      if (error.code === 'auth/email-already-in-use') return MessagesAction(dispatch, 'error', ErrorMessages.emailDuplicated)

      notifyUser()
      bugsnagClient.notify(error, buildError('error', 'googleLogin'))
    }
  }
}
