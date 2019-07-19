import PropTypes from 'prop-types'
import React from 'react'

import { Text, View } from 'react-native'

class Spacer extends React.PureComponent {
  render () {
    const { size } = this.props

    return (
      <View style={{ height: size }}>
        <Text style={{ color: '#fff', textAlign: 'center' }}/>
      </View>
    )
  }
}

Spacer.defaultProps = {
  size: 20
}

Spacer.propTypes = {
  size: PropTypes.number
}

export default Spacer
