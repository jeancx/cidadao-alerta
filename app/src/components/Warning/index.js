import PropTypes from 'prop-types'
import React from 'react'
import { Alert } from 'react-native'

class Warning extends React.PureComponent {
  static render () {
    const { message } = this.props

    return (
      Alert.alert(
        'Aviso',
        `Ocorreu um erro: \n${message}`,
        [
          { text: 'Ok', onPress: () => console.log('OK Pressed') }
        ],
        { cancelable: true }
      )
    )
  }
}

Warning.propTypes = {
  message: PropTypes.string
}

Warning.defaultProps = {
  message: ''
}

export default Warning
