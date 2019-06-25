import { AuthProvider, base64Uploader, RestProvider } from '../providers'
import firebaseConfig from './firebase.config'

const trackedResources = [{ name: 'users', isPublic: false }, { name: 'reports', isPublic: false }]
const authConfig = {
  profilePath: '/users/',
  rolesPath: '/roles/',
  allowedRoles: ['superadmin', 'admin', 'moderator', 'prefecture']
}
const authProvider = AuthProvider(authConfig)
const dataProvider = base64Uploader(RestProvider(firebaseConfig, { trackedResources }))

export { authProvider, dataProvider }