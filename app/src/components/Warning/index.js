import React from 'react'
import PropTypes from 'prop-types'

import { Alert } from 'react-native'

export default class Warning extends React.PureComponent {
  static propTypes = {
    message: PropTypes.string
  }

  static defaultProps = {
    message: ''
  }

  render () {
    return (
      Alert.alert(
        'Aviso',
        'Ocorreu um erro: \n' + this.props.message,
        [
          { text: 'Ok', onPress: () => console.log('OK Pressed') },
        ],
        { cancelable: true }
      )
    )
  }
}
