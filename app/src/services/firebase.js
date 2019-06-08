import firebase from 'firebase'
import 'firebase/firestore'
import config from '../../firebase.json'
import * as geofirex from 'geofirex'

firebase.initializeApp(config)

const auth = firebase.auth()
const firestore = firebase.firestore()
const storage = firebase.storage()
const geo = geofirex.init(firebase)

export { firebase, auth, firestore, storage, geo }

