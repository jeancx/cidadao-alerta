import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'
import { AUTH_CHECK, AUTH_GET_PERMISSIONS, AUTH_LOGIN, AUTH_LOGOUT } from 'react-admin'

const baseConfig = {
  profilePath: '/users/',
  rolesPath: '/roles/',
  allowedRoles: ['superadmin', 'admin'],
  localStorageTokenName: 'FirebaseClientToken',
  handleAuthStateChange: async (auth, config) => {
    if (auth) {
      const uid = auth.uid || auth.user.uid
      const profileSnapshot = await firebase.firestore().doc(config.profilePath + uid).get()
      const profile = await profileSnapshot.data()
      const rolesSnapshot = await firebase.firestore().doc(config.rolesPath + uid).get()
      const roles = await rolesSnapshot.data()

      if (roles && config.allowedRoles.some(role => roles[role])) {
        const firebaseToken = await auth.user.getIdToken()
        localStorage.setItem(config.localStorageTokenName, firebaseToken)
        localStorage.setItem('roles', btoa(JSON.stringify(roles)))
        return { auth, profile, roles, firebaseToken }
      } else {
        firebase.auth().signOut()
        localStorage.removeItem(config.localStorageTokenName)
        localStorage.removeItem('roles')
        throw new Error('Você não tem permissão para acessar esta área!')
      }
    } else {
      localStorage.removeItem(config.localStorageTokenName)
      localStorage.removeItem('roles')
      throw new Error('E-mail ou senha não aceitos!')
    }
  }
}

export default (config = {}) => {
  config = { ...baseConfig, ...config }

  const firebaseLoaded = () => new Promise(resolve => { firebase.auth().onAuthStateChanged(resolve) })

  return async (type, params) => {
    if (firebase.auth().currentUser) {
      await firebase.auth().currentUser.reload()
    }

    switch (type) {
      case AUTH_LOGIN:
        let auth = await firebase.auth().currentUser
        if (!auth) {
          const { username, password } = params

          auth = await firebase.auth().signInWithEmailAndPassword(username, password)
        }
        return config.handleAuthStateChange(auth, config)
      case AUTH_LOGOUT:
        config.handleAuthStateChange(null, config).catch(() => {})
        return firebase.auth().signOut()
      case AUTH_CHECK:
        await firebaseLoaded()
        if (!firebase.auth().currentUser) {
          throw new Error('sign_in_error')
        }
        return true
      case AUTH_GET_PERMISSIONS:
        return JSON.parse(atob(localStorage.getItem('roles')))
      default:
        return auth
    }
  }
};
