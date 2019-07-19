import { Dimensions } from 'react-native'

const { width } = Dimensions.get('window')

export default {
  addButton: {
    backgroundColor: '#5067FF'
  },
  img: {
    flex: 1,
    width: width - 4,
    height: 200
  }
}
