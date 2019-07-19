import { Text, View } from 'native-base'
import PropTypes from 'prop-types'
import React from 'react'

import styles from './styles'

class Messages extends React.PureComponent {
  render () {
    const { message } = this.props

    return (
      <View style={styles.section_message}>
        <Text style={styles.text_message}>{message}</Text>
      </View>
    )
  }
}

Messages.propTypes = {
  message: PropTypes.string.isRequired
}

export default Messages
