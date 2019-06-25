import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import React from 'react'
import { AppBar, Menu, Title } from 'react-admin'
import UserMenu from './UserMenu'

const styles = {
  title: {
    flex: 1,
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    overflow: 'hidden'
  },
  spacer: {
    flex: 1
  }
}

const CustomAppBar = ({ classes, ...props }) => (
  <AppBar {...props} userMenu={<UserMenu/>} menu={<Menu/>}>
    <Typography variant="title" color="inherit" className={classes.title} id="react-admin-title"/>
    <Title title={'Cidadão Alerta: '}/>
    <span className={classes.spacer}/>
  </AppBar>
)

export default withStyles(styles)(CustomAppBar)
