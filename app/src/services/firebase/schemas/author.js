import { dateToTimestamp } from './functions'

export default function buildAuthorSchema (user) {
  return {
    uid: user.firebase.uid,
    displayName: user.firebase.displayName,
    photoURL: user.firebase.photoURL,
    updatedAt: dateToTimestamp()
  }
}
