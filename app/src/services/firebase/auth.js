import bugsnagClient, { buildError, notifyUser } from 'services/bugsnag'
import { auth } from '../firebase'
import { getDocRef } from './firestore'
import { uploadImageAsync } from './storage'

export async function getCurrentUser () {
  return await auth.currentUser
}

export async function getUserProfile (userId) {
  try {
    const docSnapshot = getDocRef('users', userId).get()

    if (docSnapshot.exists) {
      return { id: docSnapshot.id, ...await docSnapshot.data() }
    } else {
      let user = await getCurrentUser()
      if (user) return await updateUserProfile(user)
    }
  } catch (error) {
    //notifyUser()
    bugsnagClient.notify(error, buildError('info', 'getUserProfile', { userId }))
    return {}
  }
}

export async function updateUserProfile (user) {
  try {
    const currentUser = await getCurrentUser()
    if (currentUser) {
      if (user.photoURL && user.photoURL.startsWith('file:')) {
        user.photoURL = await uploadImageAsync(user.photoURL, 'users', `${currentUser.uid}.jpg`)
      }

      if (user.photoURL) await currentUser.updateProfile({ photoURL: user.photoURL })
      if (user.displayName) await currentUser.updateProfile({ displayName: user.displayName })

      if (user.password && user.passwordConf && user.password === user.passwordConf) {
        await currentUser.updatePassword(user.password)
      }

      if (user.email && currentUser.email && user.email !== currentUser.email) {
        await currentUser.updateEmail(user.email).then(() => currentUser.sendEmailVerification())
      }

      const { displayName, email, photoUrl } = currentUser

      return await getDocRef('users', currentUser.uid)
        .set({ displayName, email, photoUrl: photoUrl || '' }, { merge: true })
        .then((userDoc) => ({ userDoc }))
    }
  } catch (error) {
    delete user.password
    delete user.passwordConf

    notifyUser()
    bugsnagClient.notify(error, buildError('error', 'updateUserProfile', user))

    return null
  }
}

export function sendEmailVerification () {
  try {
    return getCurrentUser().sendEmailVerification()
  } catch (error) {
    notifyUser()
    bugsnagClient.notify(error, buildError('info', 'sendEmailVerification'))
    return null
  }
}

export function sendPasswordResetEmail (emailAddress) {
  try {
    return auth.sendPasswordResetEmail(emailAddress)
  } catch (error) {
    notifyUser()
    bugsnagClient.notify(error, buildError('info', 'sendPasswordResetEmail', { emailAddress }))
    return null
  }
}
