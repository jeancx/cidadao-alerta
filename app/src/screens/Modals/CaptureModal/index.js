import Capture from 'components/Capture'
import PropTypes from 'prop-types'
import React from 'react'
import { Modal } from 'react-native'
import styles from './styles'

class CaptureModal extends React.PureComponent {
  render () {
    const { visible, save, close } = this.props

    return (
      <Modal animationType="slide" style={styles.modal} transparent={false} visible={visible} onRequestClose={close}>
        <Capture save={save} close={close}/>
      </Modal>
    )
  }
}

CaptureModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  save: PropTypes.func.isRequired,
  close: PropTypes.func.isRequired
}

export default CaptureModal
