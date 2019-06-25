import { withStyles } from '@material-ui/core/styles'
import { Map as MapIcon } from '@material-ui/icons'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Menu, MenuItemLink, Notification, setSidebarVisibility, Sidebar } from 'react-admin'
import { connect } from 'react-redux'
import logo from '../assets/images/logo.png'
import street from '../assets/images/street.png'
import AppBar from './AppBar'

const styles = theme => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    zIndex: 1,
    minHeight: '100vh',
    backgroundColor: theme.palette.background,
    position: 'relative'
  },
  appFrame: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    overflowX: 'auto'
  },
  contentWithSidebar: {
    display: 'flex',
    flexGrow: 1
  },
  sidebar: {
    backgroundColor: '#94e9fe',
    backgroundImage: `url(${street})`,
    backgroundPosition: 'bottom',
    backgroundRepeat: 'repeat-x',
    backgroundSize: 'contain'
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 2,
    padding: theme.spacing.unit * 3,
    paddingLeft: 22
  }
})

class CustomLayout extends Component {
  componentWillMount () {
    this.props.setSidebarVisibility(true)
  }

  render () {
    const { children, classes, dashboard, logout, open, title } = this.props

    return (
      <div className={classes.root}>
        <div className={classes.appFrame}>
          <AppBar title={title} open={open} logout={logout} color='primary'/>
          <main className={classes.contentWithSidebar}>
            <Sidebar className={classes.sidebar}>
              <React.Fragment>
                <img src={logo} width={'90%'} alt={'Cidadão Alerta'}/>
                <Menu logout={logout} hasDashboard={!!dashboard}/>
                <MenuItemLink to="/map" primaryText="Mapa" leftIcon={<MapIcon/>}/>
              </React.Fragment>
            </Sidebar>
            <div className={`content ${classes.content}`}>
              {children}
            </div>
          </main>
          <Notification/>
        </div>
      </div>
    )
  }
}

CustomLayout.propTypes = {
  children: PropTypes.oneOfType([PropTypes.func, PropTypes.node]),
  dashboard: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
  setSidebarVisibility: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired
}

const mapStateToProps = () => ({})
export default connect(mapStateToProps, { setSidebarVisibility })(withStyles(styles)(CustomLayout))