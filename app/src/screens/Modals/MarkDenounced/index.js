import Messages from 'components/Messages'
import Spacer from 'components/Spacer'
import ErrorMessages from 'constants/errors'
import { Form, H3, Item, Textarea } from 'native-base'
import PropTypes from 'prop-types'
import React from 'react'
import { View } from 'react-native'
import Dialog, { DialogButton, DialogContent, DialogFooter, DialogTitle } from 'react-native-popup-dialog'
import Utils from 'services/utils'
import styles from './styles'

const initialState = { description: '', errorMessage: null }

class MarkDenounced extends React.PureComponent {
  state = initialState

  saveForm = () => {
    const { description } = this.state
    const { report, user, close, save } = this.props

    if (!description) return this.setState({ errorMessage: ErrorMessages.missingDescription })

    return save('denounced', report, { description }, user).then(close)
  }

  renderFooter = () => (
    <DialogFooter>
      <DialogButton text="Cancelar" onPress={this.props.close}/>
      <DialogButton text="Confirmar" onPress={this.saveForm}/>
    </DialogFooter>
  )

  render () {
    const closeAndPreventDefault = () => {
      this.props.close()
      return true
    }

    return (
      <Dialog
        visible={this.props.visible}
        onTouchOutside={this.props.close}
        footer={this.renderFooter()}
        onHardwareBackPress={closeAndPreventDefault}
        onShow={() => this.setState(initialState)}
        dialogTitle={<DialogTitle title="Denunciar relato"/>}
      >
        <DialogContent>
          <View>
            <Form>
              <Spacer size={10}/>
              <Item>
                <H3>{Utils.limitText(this.props.report.description, 30)}</H3>
              </Item>
              <Spacer size={10}/>
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
            {this.state.errorMessage && (<Messages message={this.state.errorMessage}/>)}
          </View>
        </DialogContent>
      </Dialog>
    )
  }
}

MarkDenounced.propTypes = {
  user: PropTypes.object.isRequired,
  report: PropTypes.object.isRequired,
  visible: PropTypes.bool.isRequired,
  save: PropTypes.func.isRequired,
  close: PropTypes.func.isRequired
}

export default MarkDenounced
