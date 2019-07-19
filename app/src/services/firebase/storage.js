import bugsnagClient, { buildError, notifyUser } from 'services/bugsnag'
import { storage } from '../firebase'

function imageToBlob (imageUri) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.onload = () => resolve(xhr.response)
    xhr.onerror = (error) => reject(error)
    xhr.responseType = 'blob'
    xhr.open('GET', imageUri, true)
    xhr.send(null)
  })
}

export default async function uploadImageAsync (imageUri, folder, filename) {
  try {
    const imageBlob = await imageToBlob(imageUri)
    const ref = storage.ref(`images/${folder}`).child(filename)
    const savedImage = await ref.put(imageBlob)

    imageBlob.close()

    return await savedImage.ref.getDownloadURL()
  } catch (error) {
    notifyUser()
    bugsnagClient.notify(error,
      buildError('warning', 'uploadImageAsync', { imageUri, folder, filename })
    )
    return false
  }
}
