import { Dimensions } from 'react-native'

const DEVICE_WIDTH = Dimensions.get('window').width
const DEVICE_HEIGHT = Dimensions.get('window').height

export default {
  modal: {
    flex: 1,
    width: DEVICE_WIDTH,
    height: DEVICE_HEIGHT
  }
}
