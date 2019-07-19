import { Dimensions } from 'react-native'

const { width } = Dimensions.get('window')

export default {
  map: {
    flex: 1
  },
  container: {
    flexDirection: 'column',
    alignSelf: 'flex-start'
  },
  bubble: {
    flex: 0,
    flexDirection: 'row',
    alignSelf: 'flex-start',
    backgroundColor: '#5067FF',
    padding: 6,
    borderRadius: 50,
    borderColor: '#5067FF',
    borderWidth: 1
  },
  count: {
    color: '#fff',
    fontSize: 16
  },
  callout: {
    width: 140
  },
  modalView: {
    width: width - 20,
    height: 100,
    marginTop: 60,
    alignSelf: 'center',
    borderRadius: 5,
    backgroundColor: 'white',
    padding: 10
  },
  closeButton: {
    position: 'absolute',
    left: -8,
    right: 0,
    top: -8,
    bottom: 0
  }
}
