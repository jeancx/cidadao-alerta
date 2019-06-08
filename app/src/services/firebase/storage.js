import { storage } from '../firebase'
import bugsnagClient, { notifyUser, buildError } from 'services/bugsnag'

export async function uploadImageAsync (imageUri, folder, filename) {
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
  }
}

function imageToBlob (imageUri) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.onload = function () {
      resolve(xhr.response)
    }
    xhr.onerror = function (error) {
      reject(error)
    }
    xhr.responseType = 'blob'
    xhr.open('GET', imageUri, true)
    xhr.send(null)
  })
}
