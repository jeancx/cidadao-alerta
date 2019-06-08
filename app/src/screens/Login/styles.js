import { Dimensions } from 'react-native'

const { width, height } = Dimensions.get('window')

export default {
  loginContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2c3e50'
  },
  logo: {
    marginTop: 60,
    width: width - 60,
    height: 200
  },
  loginIcon: {
    color: '#FFFFFF',
    width: 40
  },
  loginInput: {
    color: '#FFFFFF'
  },
  line: {
    borderBottomWidth: 1,
    borderColor: 'white'
  }
}
