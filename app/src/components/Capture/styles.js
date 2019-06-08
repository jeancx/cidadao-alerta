import { Dimensions } from 'react-native'

const DEVICE_WIDTH = Dimensions.get('window').width

export default {
  cameraView: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'row'
  },
  normalFab: {
    backgroundColor: '#5067FF',
  },
  smallFab: {
    backgroundColor: '#5067FF',
    height: 46,
    width: 46
  },
  fabOnMiddle: {
    left: (DEVICE_WIDTH / 2 - 23)
  }
}
