import React from 'react'
import { connect } from 'react-redux'
import { Image, KeyboardAvoidingView } from 'react-native'
import { Button, Container, Content, Form, Icon, Input, Item, Text } from 'native-base'

import Messages from 'components/Messages'
import Spacer from 'components/Spacer'
import Loading from 'components/Loading'

import { changeInput, register } from './actions'
import styles from './styles'

class Register extends React.PureComponent {
  static navigationOptions = { header: null }

  componentDidUpdate () {
    if (this.props.isAuthenticated) {
      this.props.navigation.navigate('Dashboard')
    }
  }

  render () {
    const { form, changeInput, register, errorMessage } = this.props
    const placeholderTextColor = 'white'

    return (
      <KeyboardAvoidingView style={styles.loginContainer} behavior="padding" enabled>
        <Container style={styles.loginContainer}>
          <Content>
            <Image resizeMode="contain" style={styles.logo} source={require('assets/images/logo.png')}/>
            <Form>
              <Item last>
                <Icon active name='person' style={styles.loginIcon}/>
                <Input placeholder="Nome"
                       onChangeText={value => changeInput('displayName', value)}
                       value={form.displayName}
                       placeholderTextColor={placeholderTextColor}
                       style={styles.loginInput}/>
              </Item>
              <Item last>
                <Icon active name='mail' style={styles.loginIcon}/>
                <Input style={styles.loginInput}
                       placeholder="E-mail"
                       autoCapitalize="none"
                       keyboardType="email-address"
                       onChangeText={value => changeInput('email', value)}
                       value={form.email}
                       placeholderTextColor={placeholderTextColor}/>
              </Item>
              <Item last>
                <Icon active name='lock' style={styles.loginIcon}/>
                <Input placeholder="Senha"
                       secureTextEntry
                       onChangeText={value => changeInput('password', value)}
                       value={form.password}
                       placeholderTextColor={placeholderTextColor}
                       style={styles.loginInput}/>
              </Item>
              <Item last>
                <Icon active name='lock' style={styles.loginIcon}/>
                <Input placeholder="Confirmação de Senha"
                       secureTextEntry
                       onChangeText={value => changeInput('passwordConf', value)}
                       value={form.passwordConf}
                       placeholderTextColor={placeholderTextColor}
                       style={styles.loginInput}/>
              </Item>
              <Spacer size={20}/>
              <Button onPress={() => register(form)} iconLeft light block>
                <Icon name='log-in'/>
                <Text>Registrar</Text>
              </Button>
            </Form>
            {errorMessage && <Messages message={errorMessage}/>}

            <Loading isLoading={this.props.isLoading}/>
          </Content>
        </Container>
      </KeyboardAvoidingView>
    )
  }

  static defaultProps = {
    errorMessage: null,
  }
}

const mapStateToProps = state => ({
  isAuthenticated: state.user.isAuthenticated,
  errorMessage: state.messages.error,
  form: state.user.authForm,
  isLoading: state.messages.loading
})

const mapDispatchToProps = { changeInput, register }

export default connect(mapStateToProps, mapDispatchToProps)(Register)
