import {
  Button, Card, CardActions, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  Grid, TextField, withStyles
} from '@material-ui/core'
import classNames from 'classnames'
import firebase from 'firebase'
import PropTypes from 'prop-types'
import React from 'react'
import { Notification, translate, userLogin } from 'react-admin'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import { Field, propTypes, reduxForm } from 'redux-form'
import background from '../assets/images/city_day.png'
import logo from '../assets/images/logo.png'

const styles = theme => ({
  main: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    alignItems: 'center',
    justifyContent: 'flex-start',
    background: `url(${background})`,
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover'
  },
  card: {
    minWidth: 320,
    marginTop: '6em'
  },
  logo: {
    marginTop: 10,
    width: '100%'
  },
  logoImg: {
    width: 280,
    height: 'auto',
    display: 'block',
    marginLeft: 'auto',
    marginRight: 'auto'
  },
  icon: {
    backgroundColor: theme.palette.secondary.main
  },
  form: {
    padding: '0 1em 1em 1em'
  },
  input: {
    marginTop: '1em'
  },
  actions: {
    padding: '0 1em 1em 1em'
  },
  leftIcon: {
    marginRight: theme.spacing.unit
  },
  facebook: {
    color: 'white',
    backgroundColor: '#3C5A99',
    '&:hover': {
      backgroundColor: '#363f78'
    }
  },
  google: {
    color: 'white',
    backgroundColor: '#DB4437',
    '&:hover': {
      backgroundColor: '#b1352c'
    }
  }
})

const renderInput = ({ meta: { touched, error } = {}, input: { ...inputProps }, ...props }) => (
  <TextField error={!!(touched && error)} helperText={touched && error} {...inputProps} {...props} fullWidth/>
)

class Login extends React.PureComponent {
  state = { alertDialog: null }

  async componentDidMount () {
    if (await firebase.auth().currentUser) {
      this.login()
    }
  }

  login = (auth) => (
    this.props.userLogin(auth, this.props.location.state ? this.props.location.state.nextPathname : '/')
  )

  socialLogin = (providerName) => {
    const provider = providerName === 'google'
      ? new firebase.auth.GoogleAuthProvider()
      : new firebase.auth.FacebookAuthProvider()

    firebase.auth().useDeviceLanguage()
    firebase.auth().signInWithPopup(provider).then(this.login)
      .catch((error) => this.setState({ alertDialog: error.message }))
  }

  closeAlertDialog = () => { this.setState({ alertDialog: null }) }

  alertDialog = () => (
    <Dialog open={!!this.state.alertDialog} onClose={this.closeAlertDialog}>
      <DialogTitle>{'Alerta!'}</DialogTitle>
      <DialogContent>
        <DialogContentText>{this.state.alertDialog}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={this.closeAlertDialog} color="primary" autoFocus>OK</Button>
      </DialogActions>
    </Dialog>
  )

  render () {
    const { classes, handleSubmit, isLoading, translate } = this.props

    return (
      <div className={classes.main}>
        <Card className={classes.card}>
          <div className={classes.logo}>
            <img src={logo} className={classes.logoImg} alt={'logo'}/>
          </div>
          <form onSubmit={handleSubmit(this.login)}>
            <div className={classes.form}>
              <div className={classes.input}>
                <Field autoFocus name="username" component={renderInput} label={translate('ra.auth.username')}
                       disabled={isLoading}/>
              </div>
              <div className={classes.input}>
                <Field name="password" component={renderInput} label={translate('ra.auth.password')} type="password"
                       disabled={isLoading}/>
              </div>
            </div>
            <CardActions className={classes.actions}>
              <Grid container direction="column" spacing={16}>
                <Grid item>
                  <Button type="submit" constiant="raised" color="default" disabled={isLoading}
                          className={classes.button} fullWidth>
                    {isLoading && (<CircularProgress size={25} thickness={2}/>)}
                    {translate('ra.auth.sign_in')}
                  </Button>
                </Grid>

                <Grid item>
                  <Button constiant="raised" type="button" color="primary" disabled={isLoading}
                          onClick={() => this.socialLogin('facebook')}
                          className={classNames(classes.button, classes.facebook)} fullWidth>
                    {isLoading && (<CircularProgress size={25} thickness={2}/>)}
                    Entrar com Facebook
                  </Button>
                </Grid>

                <Grid item>
                  <Button constiant="raised" type="button" color="primary" disabled={isLoading}
                          onClick={() => this.socialLogin('google')}
                          className={classNames(classes.button, classes.google)}
                          fullWidth>
                    {isLoading && (<CircularProgress size={25} thickness={2}/>)}
                    Entrar com Google
                  </Button>
                </Grid>
              </Grid>
            </CardActions>
          </form>
        </Card>
        <Notification/>

        {this.alertDialog()}
      </div>
    )
  }
}

Login.propTypes = {
  ...propTypes,
  authProvider: PropTypes.func,
  classes: PropTypes.object,
  previousRoute: PropTypes.string,
  translate: PropTypes.func.isRequired,
  userLogin: PropTypes.func.isRequired
}

const mapStateToProps = state => ({ isLoading: state.admin.loading > 0 })

const enhance = compose(
  translate,
  reduxForm({
    form: 'signIn',
    validate: (values, props) => {
      const errors = {}
      const { translate } = props
      if (!values.username) errors.username = translate('ra.validation.required')
      if (!values.password) errors.password = translate('ra.validation.required')
      return errors
    }
  }),
  connect(
    mapStateToProps,
    { userLogin }
  ),
  withStyles(styles)
)

export default enhance(Login)
