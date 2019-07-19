import bugsnag from '@bugsnag/expo'
import { ToastAndroid } from 'react-native'

export function notifyUser (message) {
  ToastAndroid.showWithGravity(
    message || ':( Opps, algo de errado não está certo, porque não tenta novamente?',
    ToastAndroid.LONG,
    ToastAndroid.CENTER,
  )
}

export function buildError (severity, context, metaData, user) {
  return {
    severity, // 'info', 'warning' or 'error'
    context, // function where the error happen
    metaData, // key/value pairs with additional diagnostic information
    user, // Supply information about the user who experienced the error
  }
}

const bugsnagClient = bugsnag()
export default bugsnagClient
