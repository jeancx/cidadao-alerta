import PropTypes from 'prop-types'
import React from 'react'
import Spinner from 'react-native-loading-spinner-overlay'

import styles from './styles'

class Loading extends React.PureComponent {
  state = { cancelable: false }

  componentDidUpdate (prevProps) {
    if (!prevProps.isLoading && this.props.isLoading) {
      this.setState({ cancelable: false })

      setTimeout(() => {
        this.setState({ cancelable: true })
      }, 5000)
    }
  }

  render = () => (
    <Spinner
      visible={this.props.isLoading}
      animation={'fade'}
      cancelable={this.state.cancelable}
      textStyle={styles.spinnerTextStyle}
    />
  )
}

Loading.propTypes = {
  isLoading: PropTypes.bool.isRequired
}

export default Loading
