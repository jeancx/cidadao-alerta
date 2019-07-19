import bugsnagClient, { notifyUser, buildError } from 'services/bugsnag'
import { firestore as firestoreDb } from '../firebase'

export function getCollectionRef (collName) {
  return firestoreDb.collection(collName)
}

export function getDocRef (collName, docId) {
  return getCollectionRef(collName).doc(docId)
}

export function getSubcollectionRef (collName, docId, subCollName) {
  return getDocRef(collName, docId).collection(subCollName)
}

export function fireStoreDocsToArray (docs) {
  return Promise.all([...docs].map(doc => ({ id: doc.id, ...doc.data() })))
}

export async function fetchCollectionAsync (collName, columnOrder, order = 'asc') {
  try {
    let collectionRef = getCollectionRef(collName)
    if (columnOrder) { collectionRef = collectionRef.orderBy(columnOrder, order) }
    const allItems = await collectionRef.get()

    return await fireStoreDocsToArray(allItems.docs)
  } catch (error) {
    notifyUser()
    bugsnagClient.notify(error,
      buildError('info', 'fetchCollectionAsync', { collName, columnOrder, order })
    )
    return []
  }
}

export async function fetchSubcolectionAsync (collName, docId, subCollName, columnOrder, order = 'asc') {
  try {
    let subCollectionRef = getCollectionRef(collName).doc(docId).collection(subCollName)
    if (columnOrder) { subCollectionRef = subCollectionRef.orderBy(columnOrder, order) }
    const allItems = await subCollectionRef.get()

    return await fireStoreDocsToArray(allItems.docs)
  } catch (error) {
    notifyUser()
    bugsnagClient.notify(
      error,
      buildError('info', 'fetchSubcolectionAsync', { collName, docId, subCollName, columnOrder, order })
    )
    return []
  }
}

export async function fetchDocAsync (collName, docId) {
  try {
    const doc = await getCollectionRef(collName).doc(docId).get()

    return { id: doc.id, ...await doc.data() }
  } catch (error) {
    notifyUser()
    bugsnagClient.notify(error, buildError('info', 'fetchDocAsync', { collName, docId }))
    return {}
  }
}

export async function updateDocSubcolectionAsync (collName, docId) {
  try {
    const doc = await getCollectionRef(collName).doc(docId).get()

    return { id: doc.id, ...await doc.data() }
  } catch (error) {
    notifyUser()
    bugsnagClient.notify(
      error, buildError('error', 'updateDocSubcolectionAsync', { collName, docId })
    )
    return {}
  }
}

export async function updateDocTransactionAsync (collName, docId, updateDataCallback) {
  try {
    const reportRef = getDocRef(collName, docId)

    return await firestoreDb.runTransaction(transacion =>
      transacion.get(reportRef)
        .then(async doc => {
          const docData = await doc.data()
          const updatedData = updateDataCallback(docData)

          transacion.update(reportRef, updatedData)

          return { id: doc.id, ...docData, ...updatedData }
        })
    )
  } catch (error) {
    notifyUser()
    bugsnagClient.notify(error,
      buildError('info', 'updateDocTransactionAsync', { collName, docId })
    )
    return {}
  }
}
