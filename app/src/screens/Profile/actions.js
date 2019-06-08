import MessagesAction from 'components/Messages/actions'
import { getCurrentUser, getUserProfile, updateUserProfile } from 'services/firebase/auth'
import bugsnagClient, { notifyUser, buildError } from 'services/bugsnag'

export function fillProfileForm () {
  return async dispatch => {
    await MessagesAction(dispatch, 'loading', true)

    try {
      const currentUser = await getCurrentUser()
      const user = await getUserProfile(currentUser.uid)

      dispatch({
        type: 'USER_FILL_PROFILE_FORM',
        data: {
          profileForm: {
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL,
            email: currentUser.email,
            password: null,
            passwordConf: null,
            phoneNumber: user.phoneNumber,
            city: user.city,
            state: user.state,
            neighborhood: user.neighborhood,
            street: user.street
          }
        }
      })

      dispatch({ type: 'FIREBASE_USER_UPDATE', data: { user: currentUser } })
    } catch (error) {
      notifyUser()
      bugsnagClient.notify(error, buildError('warning', 'fillProfileForm'))
    }

    MessagesAction(dispatch, 'loading', false)
  }
}

export function changeInput (name, value) {
  return dispatch => new Promise(resolve => {
    resolve(
      dispatch({
        type: 'USER_CHANGE_PROFILE_INPUT',
        data: { name, value }
      })
    )
  })
}

export function save (user) {
  return async dispatch => {
    await MessagesAction(dispatch, 'loading', true)

    try {
      const updatedUser = await updateUserProfile(user)
      dispatch(fillProfileForm())
    } catch (error) {
      delete user.password
      delete user.passwordConf

      notifyUser()
      bugsnagClient.notify(error, buildError('error', 'save', null, user))
    }

    MessagesAction(dispatch, 'loading', false)
  }
}

export function logout () {
  return dispatch => new Promise(async resolve => {
    resolve(
      dispatch({
        type: 'USER_LOGOUT'
      })
    )
  })
}
