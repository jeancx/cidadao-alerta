import React from 'react'
import PropTypes from 'prop-types'

import { Modal } from 'react-native'

import Capture from 'components/Capture'

import styles from './styles'

export default class CaptureModal extends React.PureComponent {
  render () {
    const { visible, save, close } = this.props

    return (
      <Modal animationType="slide" style={styles.modal} transparent={false} visible={visible} onRequestClose={close}>
        <Capture save={save} close={close}/>
      </Modal>
    )
  }

  static propTypes = {
    visible: PropTypes.bool.isRequired,
    save: PropTypes.func.isRequired,
    close: PropTypes.func.isRequired
  }
}
