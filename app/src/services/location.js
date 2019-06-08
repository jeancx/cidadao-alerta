import { Location, Permissions } from 'expo'
import { ToastAndroid } from 'react-native'

export async function getCurrentLocation () {
  let { status } = await Permissions.askAsync(Permissions.LOCATION)

  if (status !== 'granted') {
    const message = 'Permissão para acessar a Localização, necessária!'
    ToastAndroid.showWithGravity(message, ToastAndroid.LONG, ToastAndroid.CENTER)
    return { latitude: -27.2824166, longitude: -48.8498116 }
  } else {
    let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High })
    return location.coords
  }

  return false
}
