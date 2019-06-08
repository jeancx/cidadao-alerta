import { Dimensions } from 'react-native'

const { width } = Dimensions.get('window')

export default {
  view: {
    width: width * 0.8
  },
  textArea: {
    marginLeft: 0,
    padding: 10
  }
}
