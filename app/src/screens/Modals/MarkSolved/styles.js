import { Dimensions } from 'react-native'

const DEVICE_WIDTH = Dimensions.get('window').width

export default {
  picturesView: {
    paddingTop: 20,
    height: 100,
    flexDirection: 'row'
  },
  textArea: {
    marginLeft: 0,
    padding: 10
  }
}
