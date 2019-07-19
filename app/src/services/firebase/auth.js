import bugsnagClient, { buildError, notifyUser } from 'services/bugsnag'
import { auth } from '../firebase'
import { getDocRef } from './firestore'
import uploadImageAsync from './storage'

export function getCurrentUser () {
  return auth.currentUser
}

export async function updateUserProfile (user) {
  const currentUser = await getCurrentUser()
  delete currentUser.password
  delete currentUser.passwordConf

  try {
    if (currentUser) {
      if (user.photoURL && user.photoURL.startsWith('file:')) {
        currentUser.photoURL = await uploadImageAsync(user.photoURL, 'users', `${currentUser.uid}.jpg`)
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
    notifyUser()
    bugsnagClient.notify(error, buildError('error', 'updateUserProfile', currentUser))
  }
  return null
}

export async function getUserProfile (userId) {
  try {
    const docSnapshot = getDocRef('users', userId).get()

    if (docSnapshot.exists) {
      return { id: docSnapshot.id, ...await docSnapshot.data() }
    }

    return await updateUserProfile(await getCurrentUser())
  } catch (error) {
    bugsnagClient.notify(error, buildError('info', 'getUserProfile', { userId }))
    return {}
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
