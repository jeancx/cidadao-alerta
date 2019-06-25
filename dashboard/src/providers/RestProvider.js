import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'

import { CREATE, DELETE, DELETE_MANY, GET_LIST, GET_MANY, GET_MANY_REFERENCE, GET_ONE, UPDATE } from 'react-admin'
import Methods from './methods'

const BaseConfiguration = {
  initialQuerytimeout: 10000,
  timestampFieldNames: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  }
}

const RestProvider = (firebaseConfig = {}, options = {}) => {
  options = Object.assign({}, BaseConfiguration, options)
  const { timestampFieldNames, trackedResources } = options

  const resourcesStatus = {}
  const resourcesData = {}
  const resourcesPaths = {}
  const resourcesUploadFields = {}

  if (firebase.apps.length === 0) {
    firebase.initializeApp(firebaseConfig)
    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION)
  }

  const upload = options.upload || Methods.upload
  const save = options.save || Methods.save
  const del = options.del || Methods.del
  const getItemID = options.getItemID || Methods.getItemID
  const getOne = options.getOne || Methods.getOne
  const getMany = options.getMany || Methods.getMany
  const getManyReference = options.getManyReference || Methods.getManyReference
  const delMany = options.delMany || Methods.delMany
  const getList = options.getList || Methods.getList

  const firebaseSaveFilter = options.firebaseSaveFilter ? options.firebaseSaveFilter : data => data

  trackedResources.forEach((resource, index) => {
    if (typeof resource === 'string') {
      resource = {
        name: resource,
        path: resource,
        uploadFields: []
      }
      trackedResources[index] = resource
    }

    const { name, path, uploadFields } = resource
    if (!resource.name) {
      throw new Error(`name is missing from resource ${resource}`)
    }
    resourcesUploadFields[name] = uploadFields || []
    resourcesPaths[name] = path || name
    resourcesData[name] = {}
  })

  return async (type, resourceName, params) => {
    await resourcesStatus[resourceName]
    let previous = {}, resourcePath = '', uploadResults = [], isNew = false

    switch (type) {
      case GET_LIST:
        return await getList(params, resourceName, resourcesData[resourceName])
      case GET_MANY:
        return await getMany(params, resourceName, resourcesData[resourceName])
      case GET_MANY_REFERENCE:
        return await getManyReference(params, resourceName, resourcesData[resourceName])
      case GET_ONE:
        return await getOne(params, resourceName, resourcesData[resourceName])
      case DELETE:
        const uploadFields = resourcesUploadFields[resourceName] ? resourcesUploadFields[resourceName] : []
        return await del(params.id, resourceName, resourcesPaths[resourceName], uploadFields)
      case DELETE_MANY:
        return await delMany(params.ids, resourceName, resourcesData[resourceName])
      case UPDATE:
        resourcePath = resourceName
        delete params.data.id
        return await save(
          params.id, params.data, previous, resourceName, resourcePath, firebaseSaveFilter,
          uploadResults, isNew, timestampFieldNames
        )
      case CREATE:
        const itemID = getItemID(params, type, resourceName, resourcesPaths[resourceName], resourcesData[resourceName])
        uploadResults = await Promise.all(
          resourcesUploadFields[resourceName]
            ? resourcesUploadFields[resourceName]
              .map(field => upload(field, params.data, itemID, resourceName, resourcesPaths[resourceName]))
            : []
        )
        previous = resourcesData[resourceName][itemID] || {}
        isNew = true

        return await save(
          itemID, params.data, previous, resourceName, resourcesPaths[resourceName],
          firebaseSaveFilter, uploadResults, isNew, timestampFieldNames
        )
      default:
        console.error('Undocumented method: ', type)
        return { data: [] }
    }
  }
}

export default RestProvider
