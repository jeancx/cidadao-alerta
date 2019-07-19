import Messages from 'components/Messages'
import ErrorMessages from 'constants/errors'
import { Form, Item, Textarea } from 'native-base'
import PropTypes from 'prop-types'
import React from 'react'
import { View } from 'react-native'
import { Avatar } from 'react-native-elements'
import Dialog, { DialogButton, DialogContent, DialogFooter, DialogTitle } from 'react-native-popup-dialog'
import CaptureModal from 'screens/Modals/CaptureModal'
import styles from './styles'

const initialState = { description: '', pictures: [], takingPicture: false, errorMessage: null }

class MarkSolved extends React.PureComponent {
  state = initialState

  savePicture = (picture) => {
    this.setState(state => ({ pictures: [...state.pictures, picture], takingPicture: false }))
  }

  removePicture = (picture) => {
    this.setState(state => (
      { pictures: [...state.pictures].filter(item => item !== picture), takingPicture: false }
    ))
  }

  saveForm = () => {
    const { description, pictures } = this.state
    const { report, user, close, save } = this.props

    if (!description) return this.setState({ errorMessage: ErrorMessages.missingDescription })
    if (pictures.length <= 0) return this.setState({ errorMessage: ErrorMessages.missingPicture })

    save('solved', report, { description, pictures }, user).then(close)
  }

  renderThumbnail = (picture) => {
    if (picture) {
      return (
        <Avatar
          source={{ uri: picture }}
          onPress={() => this.removePicture(picture)}
          onEditPress={() => this.removePicture(picture)}
          showEditButton
          editButton={{ name: 'highlight-off' }}
          style={{ flex: 1 }}
        />
      )
    } else {
      return (
        <Avatar
          icon={{ name: 'add-a-photo', type: 'material' }}
          onPress={() => {this.setState({ takingPicture: true })}}
          style={{ flex: 1 }}
        />
      )
    }
  }

  renderFooter = () => (
    <DialogFooter>
      <DialogButton text="Cancelar" onPress={this.props.close}/>
      <DialogButton text="Confirmar" onPress={this.saveForm}/>
    </DialogFooter>
  )

  render () {
    const { visible, close } = this.props
    const { takingPicture, pictures, errorMessage } = this.state
    const closeAndPreventDefault = () => close() || true

    return (
      <Dialog
        visible={visible}
        onTouchOutside={close}
        footer={this.renderFooter()}
        onHardwareBackPress={closeAndPreventDefault}
        onShow={() => this.setState(initialState)}
        dialogTitle={<DialogTitle title="Marcar relato como resolvido"/>}
      >
        <DialogContent>
          <View>
            <CaptureModal
              save={this.savePicture}
              close={() => this.setState({ takingPicture: false })}
              visible={takingPicture}
            />
            <View style={styles.picturesView}>
              {this.renderThumbnail(pictures[0])}
              {this.renderThumbnail(pictures[1])}
              {this.renderThumbnail(pictures[2])}
            </View>
            <Form>
              <Item>
                <Textarea
                  rowSpan={5}
                  bordered={false}
                  placeholder={'Descrição: Escreve sobre a solução do problema (Quanto mais detalhado melhor).'}
                  onChangeText={description => this.setState({ description })}
                  style={styles.textArea}
                />
              </Item>
            </Form>
            {errorMessage && (<Messages message={errorMessage}/>)}
          </View>
        </DialogContent>
      </Dialog>
    )
  }
}

MarkSolved.propTypes = {
  user: PropTypes.object.isRequired,
  report: PropTypes.object.isRequired,
  visible: PropTypes.bool.isRequired,
  save: PropTypes.func.isRequired,
  close: PropTypes.func.isRequired
}

export default MarkSolved
