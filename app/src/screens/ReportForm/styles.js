import { Dimensions } from 'react-native'

const DEVICE_WIDTH = Dimensions.get('window').width

export default {
  container: {
    flex: 1
  },
  picker: {
    width: DEVICE_WIDTH
  },
  swiperView: {
    flex: 1,
    height: 150
  },
  textArea: {
    width: DEVICE_WIDTH - 40,
    marginLeft: 0,
    padding: 10
  }
}
