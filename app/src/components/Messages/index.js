import React from 'react'
import PropTypes from 'prop-types'

import { View, Text } from 'native-base'

import styles from './styles'

export default class Messages extends React.PureComponent {
  render () {
    return (
      <View style={styles.section_message}>
        <Text style={styles.text_message}>{this.props.message}</Text>
      </View>
    )
  }

  static propTypes = {
    message: PropTypes.string
  }

  static defaultProps = {
    message: ''
  }
}
