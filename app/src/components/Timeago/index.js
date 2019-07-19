import moment from 'moment'
import 'moment/locale/pt-br'
import PropTypes from 'prop-types'
import React from 'react'
import * as RNTimeAgo from 'react-native-timeago'

moment.locale('pt-br')

class Timeago extends React.PureComponent {
  render () {
    const { seconds } = this.props

    return (
      <RNTimeAgo time={moment.unix(seconds)} hideAgo interval={20000}/>
    )
  }
}

Timeago.defaultProps = {
  seconds: 0
}

Timeago.propTypes = {
  seconds: PropTypes.number
}

export default Timeago
