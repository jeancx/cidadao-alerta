import Loading from 'components/Loading'
import Messages from 'components/Messages'
import Spacer from 'components/Spacer'
import { Button, Container, Content, Form, Icon, Input, Item, Text } from 'native-base'
import React from 'react'
import { Image, KeyboardAvoidingView, View } from 'react-native'
import { NavigationActions } from 'react-navigation'
import { connect } from 'react-redux'
import { authenticate, changeInput, facebookLogin, googleLogin, resetLoading } from './actions'
import styles from './styles'

class Login extends React.PureComponent {
  static navigationOptions = { header: null }

  componentDidMount () {
    this.props.resetLoading()

    this.goToDashboard()
  }

  componentDidUpdate () {
    this.goToDashboard()
  }

  goToDashboard () {
    if (this.props.isAuthenticated) {
      this.props.navigation.reset([NavigationActions.navigate({ routeName: 'Dashboard' })], 0)
    }
  }

  render () {
    const { errorMessage, form, changeInput, authenticate, facebookLogin, googleLogin, navigation } = this.props
    const placeholderTextColor = 'white'

    return (
      <KeyboardAvoidingView style={styles.loginContainer} behavior="padding" enabled>
        <Container style={styles.loginContainer}>
          <Content>
            <Image resizeMode="contain" style={styles.logo} source={require('assets/images/logo.png')}/>
            <Form>
              <Item last>
                <Icon active name='mail' style={styles.loginIcon}/>
                <Input
                  style={styles.loginInput}
                  placeholder="E-mail"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  onChangeText={value => changeInput('email', value)}
                  value={form.email}
                  placeholderTextColor={placeholderTextColor}
                />
              </Item>
              <Item last>
                <Icon active name='lock' style={styles.loginIcon}/>
                <Input
                  placeholder="Senha"
                  secureTextEntry
                  onChangeText={value => changeInput('password', value)}
                  value={form.password}
                  placeholderTextColor={placeholderTextColor}
                  style={styles.loginInput}
                />
              </Item>

              {errorMessage && <Messages message={errorMessage}/>}

              <Spacer size={20}/>
              <Button onPress={() => authenticate(form.email, form.password)} iconLeft light block>
                <Icon name='log-in'/>
                <Text>Login</Text>
              </Button>
              <Spacer size={10}/>
              <Button onPress={googleLogin} iconLeft danger block>
                <Icon name='logo-google'/>
                <Text>Entrar com Google</Text>
              </Button>
              <Spacer size={10}/>
              <Button onPress={facebookLogin} iconLeft block>
                <Icon name='logo-facebook'/>
                <Text>Entrar com Facebook</Text>
              </Button>
              <Spacer size={15}/>
              <View style={styles.line}/>
              <Spacer size={15}/>
              <Button onPress={() => navigation.navigate('Register')} iconLeft transparent bordered light block>
                <Icon name='person'/>
                <Text>Registro</Text>
              </Button>
            </Form>
            <Loading isLoading={this.props.isLoading}/>
          </Content>
        </Container>
      </KeyboardAvoidingView>
    )
  }
}

Login.defaultProps = {
  errorMessage: null
}

const mapStateToProps = state => ({
  isAuthenticated: state.user.isAuthenticated,
  user: state.user,
  errorMessage: state.messages.error,
  form: state.user.authForm,
  isLoading: state.messages.loading
})

const mapDispatchToProps = { resetLoading, changeInput, authenticate, facebookLogin, googleLogin }

export default connect(mapStateToProps, mapDispatchToProps)(Login)
