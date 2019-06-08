import React from 'react'

import TimeAgo from 'react-native-timeago'
import moment from 'moment'
import 'moment/locale/pt-br'

moment.locale('pt-br')

export default class Timeago extends React.PureComponent {
  render () {
    return (
      <TimeAgo time={moment.unix(this.props.seconds)} hideAgo={true} interval={20000}/>
    )
  }

  static defaultProps = {
    seconds: 0
  }
}
