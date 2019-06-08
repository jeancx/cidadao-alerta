import { Form, Item, Textarea } from 'native-base'
import PropTypes from 'prop-types'
import React from 'react'
import { View } from 'react-native'
import Dialog, { DialogButton, DialogContent, DialogFooter, DialogTitle } from 'react-native-popup-dialog'
import styles from './styles'

export default class EditComment extends React.PureComponent {
  state = { text: null }

  saveForm = () => {
    const { text } = this.state
    const { comment, close, save } = this.props

    save({ ...comment, text }).then(close)
  }

  renderFooter = () => (
    <DialogFooter>
      <DialogButton text="Cancelar" onPress={this.props.close}/>
      <DialogButton text="Confirmar" disabled={!this.state.text} onPress={this.saveForm}/>
    </DialogFooter>
  )

  render () {
    const closeAndPreventDefault = () => {
      this.props.close()
      return true
    }
    const { comment } = this.props

    return (
      <Dialog
        visible={this.props.visible}
        onTouchOutside={this.props.close}
        footer={this.renderFooter()}
        onHardwareBackPress={closeAndPreventDefault}
        onShow={() => this.setState({ text: comment.text })}
        dialogTitle={<DialogTitle title="Editar comentário"/>}
      >
        <DialogContent>
          <View>
            <Form>
              <Item>
                <Textarea
                  rowSpan={5}
                  bordered={false}
                  onChangeText={text => this.setState({ text })}
                  value={this.state.text}
                  style={styles.textArea}
                />
              </Item>
            </Form>
          </View>
        </DialogContent>
      </Dialog>
    )
  }

  static propTypes = {
    visible: PropTypes.bool.isRequired,
    save: PropTypes.func.isRequired,
    close: PropTypes.func.isRequired,
    comment: PropTypes.object.isRequired
  }
}
