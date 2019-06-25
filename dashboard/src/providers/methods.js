import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'
import 'firebase/storage'
import _ from 'lodash'
import { CREATE } from 'react-admin'
import sortBy from 'sort-by'

const currentUser = firebase.auth().currentUser

const convertFileToBase64 = file =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file.rawFile)

    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
  })

const addUploadFeature = requestHandler => (type, resource, params) => {
  if (type === 'UPDATE') {
    if (params.data.image && params.data.image.length) {
      const formerPictures = params.data.image.filter(p => !(p.rawFile instanceof File))
      const newPictures = params.data.image.filter(p => p.rawFile instanceof File)

      return Promise.all(newPictures.map(convertFileToBase64))
        .then(base64Pictures =>
          base64Pictures.map(picture64 => ({
            src: picture64,
            title: `${params.data.title}`
          }))
        )
        .then(transformedNewPictures =>
          requestHandler(type, resource, {
            ...params,
            data: {
              ...params.data,
              image: [...transformedNewPictures, ...formerPictures]
            }
          })
        )
    }
  }
  return requestHandler(type, resource, params)
}

const getImageSize = file => {
  return new Promise(resolve => {
    const img = document.createElement('img')
    img.onload = function () {
      resolve({
        width: this.width,
        height: this.height
      })
    }
    img.src = file.src
  })
}

const upload = async (fieldName, submitedData, id, resourceName, resourcePath) => {
  const file = submitedData[fieldName] && submitedData[fieldName][0]
  const rawFile = file.rawFile

  const result = {}
  if (file && rawFile && rawFile.name) {
    const ref = firebase
      .storage()
      .ref()
      .child(`${resourcePath}/${id}/${fieldName}`)
    const snapshot = await ref.put(rawFile)
    result[fieldName] = [{}]
    result[fieldName][0].uploadedAt = new Date()
    result[fieldName][0].src = snapshot.downloadURL.split('?').shift() + '?alt=media'
    result[fieldName][0].type = rawFile.type
    if (rawFile.type.indexOf('image/') === 0) {
      try {
        const imageSize = await getImageSize(file)
        result[fieldName][0].width = imageSize.width
        result[fieldName][0].height = imageSize.height
      } catch (e) {
        console.error(`Failed to get image dimensions`)
      }
    }
    return result
  }
  return false
}

const save = async (
  id, data, previous, resourceName, resourcePath, firebaseSaveFilter, uploadResults, isNew, timestampFieldNames
) => {
  if (uploadResults) { uploadResults.map(uploadResult => (uploadResult ? Object.assign(data, uploadResult) : false)) }
  if (isNew) { Object.assign(data, { [timestampFieldNames.createdAt]: new Date() }) }
  data = Object.assign(previous, { [timestampFieldNames.updatedAt]: new Date() }, data)

  await firebase.firestore().doc(`${resourcePath}/${data.id}`).set(firebaseSaveFilter(data))
  return { data }
}

const del = async (id, resourceName, resourcePath, uploadFields) => {
  if (uploadFields.length) {
    uploadFields.map(fieldName =>
      firebase.storage().ref().child(`${resourcePath}/${id}/${fieldName}`).delete()
    )
  }

  await firebase
    .firestore()
    .doc(`${resourcePath}/${id}`)
    .delete()
  return { data: id }
}

const delMany = async (ids, resourceName, previousData) => {
  await ids.map(id => firebase.firestore().doc(`${resourceName}/${id}`).delete())
  return { data: ids }
}

const getItemID = (params, type, resourceName, resourcePath, resourceData) => {
  let itemId = params.data.id || params.id || params.data.key || params.key
  if (!itemId) {
    itemId = firebase.firestore().collection(resourcePath).doc().id
  }

  if (!itemId) {
    throw new Error('ID is required')
  }

  if (resourceData && resourceData[itemId] && type === CREATE) {
    throw new Error('ID already in use')
  }

  return itemId
}

const getOne = async (params, resourceName) => {
  if (params.id) {
    let result = await firebase.firestore().collection(resourceName).doc(params.id).get()

    if (result.exists) {
      const data = result.data()

      if (data && data.id == null) {
        data['id'] = result.id
      }
      return { data: data }
    } else {
      throw new Error('Id not found')
    }
  } else {
    throw new Error('Id not found')
  }
}

const getList = async (params, resource) => {
  let values = []
  let query = firebase.firestore()

  if (typeof resource === 'string') {
    query = query.collection(resource)
  } else {
    resource.forEach(item => {
      query = item.type === 'collection' ? query.collection(item.value) : query.doc(item.value)
    })
  }

  if (currentUser && currentUser.customClaims && currentUser.customClaims.prefecture && currentUser.customClaims.city) {
    query.where('address.city', '==', currentUser.customClaims.city)
  }

  if (currentUser && currentUser.customClaims && currentUser.customClaims.moderator && currentUser.customClaims.city) {
    query.where('address.city', '==', currentUser.customClaims.city)
  }

  let snapshots = await query.get()

  for (const snapshot of snapshots.docs) {
    const data = snapshot.data()
    if (data && data.id == null) {
      data['id'] = snapshot.id
    }
    values.push(data)
  }

  if (params.filter) {
    values = _.filter(values, params.filter)
  }

  if (params.sort) {
    values.sort(sortBy(`${params.sort.order === 'ASC' ? '-' : ''}${params.sort.field}`))
  }

  const keys = values.map(i => i.id)
  const page = params.pagination && params.pagination.page ? params.pagination.page : 1
  const perPage = params.pagination && params.pagination.perPage ? params.pagination.perPage : Number.POSITIVE_INFINITY
  const _start = (page - 1) * perPage
  const _end = page * perPage
  const data = values ? values.slice(_start, _end) : []
  const ids = keys.slice(_start, _end) || []
  const total = values ? values.length : 0
  return { data, ids, total }
}

const getMany = async (params, resourceName, resourceData) => {
  let data = []
  for (const id of params.ids) {
    let { data: item } = await getOne({ id }, resourceName, resourceData)
    data.push(item)
  }
  return { data }
}

const getManyReference = async (params, resourceName, resourceData) => {
  if (params.target) {
    if (!params.filter) params.filter = {}
    params.filter[params.target] = params.id
    let { data, total } = await getList(params, resourceName, resourceData)
    return { data, total }
  } else {
    throw new Error('Error processing request')
  }
}

export default {
  upload,
  save,
  del,
  delMany,
  getItemID,
  getOne,
  getList,
  getMany,
  getManyReference,
  addUploadFeature,
  convertFileToBase64
}
