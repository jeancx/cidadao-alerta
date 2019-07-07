import { Icon } from 'native-base'
import PropTypes from 'prop-types'
import React from 'react'
import { Modal, Text, TouchableHighlight, TouchableOpacity, View } from 'react-native'
import styles from './styles'

class Popup extends React.PureComponent {
  render () {
    const { visible, close, children, confirm, cancel, confirmTitle, cancelTitle } = this.props
    const iconType = 'MaterialCommunityIcons'
    const actionButtonsProps = { underlayColor: '#eeeeee', activeOpacity: .9 }

    return (
      <Modal visible={visible} transparent hardwareAccelerated style={styles.modal} onRequestClose={close}>
        <TouchableOpacity activeOpacity={0} onPress={close} style={styles.closeButton}/>
        <View style={styles.view}>
          <Icon style={styles.closeIcon} name="close" color={'#333'} size={20} onPress={close} type={iconType}/>
          <View style={styles.mainContent}>
            <View style={styles.content}>{children}</View>
          </View>
          <View style={styles.actionButtons}>
            <TouchableHighlight {...actionButtonsProps} onPress={confirm} style={styles.confirmButton}>
              <Text style={styles.confirmTitle}>{confirmTitle}</Text>
            </TouchableHighlight>
            <TouchableHighlight {...actionButtonsProps} onPress={cancel} style={styles.cancelButton}>
              <Text style={styles.cancelTitle}>{cancelTitle}</Text>
            </TouchableHighlight>
          </View>
        </View>
      </Modal>
    )
  }
}

Popup.defaultProps = {
  confirmTitle: 'Confirmar',
  cancelTitle: 'Cancelar',
  type: 'information',
  close: () => {},
  cancel: () => {},
  confirm: () => {}
}

Popup.propTypes = {
  confirmTitle: PropTypes.string,
  cancelTitle: PropTypes.string,
  visible: PropTypes.bool.isRequired,
  type: PropTypes.oneOf(['information', 'alert']),
  close: PropTypes.func,
  confirm: PropTypes.func,
  cancel: PropTypes.func
}

export default Popup
