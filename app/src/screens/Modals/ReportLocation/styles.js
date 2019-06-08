import { Dimensions } from 'react-native'

const DEVICE_WIDTH = Dimensions.get('window').width

export default {
  map: {
    flex: 1
  },
  autocompleteContainer: {
    flex: 1,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 1
  },
  locateButton: {
    backgroundColor: '#5067FF',
    marginBottom: 50
  }
}
