import { firebase } from 'services/firebase'

export function dateToTimestamp (date) {
  return (date && date instanceof Date) ?
    new firebase.firestore.Timestamp(date.getSeconds()) :
    firebase.firestore.FieldValue.serverTimestamp()
}

export function coordsToGeopoint (geolocation) {
  return new firebase.firestore.GeoPoint(geolocation.latitude, geolocation.longitude)
}
