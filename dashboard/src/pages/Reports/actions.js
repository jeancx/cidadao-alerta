import {
  Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Input, ListItemIcon, ListItemText, Menu,
  MenuItem, MenuList, withStyles
} from '@material-ui/core'
import {
  Check as ConfirmIcon, Close as CancelIcon, Close as CloseIcon, Delete as DeleteIcon, Menu as MenuIcon
} from '@material-ui/icons'
import React from 'react'
import { withDataProvider } from 'react-admin'
import { connect } from 'react-redux'
import compose from 'recompose/compose'

const API_URL = 'https://us-central1-cidadao-alerta-2019.cloudfunctions.net'

const styles = theme => ({
  button: {
    color: 'white'
  },
  actionIcon: {
    marginRight: 10
  }
})

class ShowActions extends React.PureComponent {
  state = { anchorEl: null, deleteDialog: false, disableDialog: false, reason: '' }

  postToApi = (route, body) => {
    return fetch(API_URL + route, {
      method: 'post',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('FirebaseClientToken')
      },
      body: { reportId: this.props.id, ...body }
    })
  }

  handleClick = event => {
    this.setState({ anchorEl: event.currentTarget })
  }

  handleClose = () => {
    this.setState({ anchorEl: null })
  }

  onInputChange = (event) => {
    const { name, value } = event.target
    this.setState({ [name]: value })
  }

  confirmDisable = () => {
    return this.postToApi('/api/v1/reports', { type: 'disable', reason: this.state.reason })
  }

  disableDialog = () => {
    const { classes } = this.props
    const { disableDialog } = this.state

    return (
      <Dialog open={disableDialog} onClose={() => this.setState({ disableDialog: false })}>
        <DialogTitle>
          Deseja <span style={{ color: 'red' }}>DESATIVAR</span> este relato?
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            <Input
              name="reason"
              rows={10}
              placeholder="Informe o motivo."
              onChange={this.onInputChange}
              fullWidth
            />
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={this.confirmDisable} color="secondary">
            <ConfirmIcon className={classes.button}/> Confirmar
          </Button>
          <Button onClick={() => this.setState({ disableDialog: false })} color="default">
            <CancelIcon className={classes.button}/> Cancelar
          </Button>
        </DialogActions>
      </Dialog>
    )
  }

  confirmDelete = () => {
    return this.postToApi('/api/v1/reports', { type: 'delete', reason: this.state.reason })
  }

  deleteDialog = () => {
    const { classes } = this.props
    const { deleteDialog } = this.state

    return (
      <Dialog open={deleteDialog} onClose={() => this.setState({ deleteDialog: false })}>
        <DialogTitle>
          Deseja <span style={{ color: 'red' }}>EXCLUIR</span> este relato?
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            <Input
              name="reason"
              rows={10}
              placeholder="Informe o motivo."
              onChange={this.onInputChange}
              fullWidth
            />
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={this.confirmDelete} color="secondary">
            <ConfirmIcon className={classes.button}/> Confirmar
          </Button>
          <Button onClick={() => this.setState({ deleteDialog: false })} color="default">
            <CancelIcon className={classes.button}/> Cancelar
          </Button>
        </DialogActions>
      </Dialog>
    )
  }

  render () {
    const { disableDialog, deleteDialog } = this
    const { anchorEl } = this.state
    const open = Boolean(anchorEl)

    return (
      <React.Fragment>
        <Button
          variant="fab"
          color={'secondary'}
          aria-owns={open ? 'simple-menu' : null}
          aria-haspopup="true"
          onClick={this.handleClick}
          style={{ zIndex: 2, display: 'inline-block', float: 'right' }}
        >
          <MenuIcon/>
        </Button>
        <Menu id="simple-menu" anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={this.handleClose}>
          <MenuList>
            <MenuItem onClick={() => this.setState({ disableDialog: true })}>
              <ListItemIcon>
                <CloseIcon/>
              </ListItemIcon>
              <ListItemText inset primary="Desativar"/>
            </MenuItem>
            <MenuItem onClick={() => this.setState({ deleteDialog: true })}>
              <ListItemIcon>
                <DeleteIcon/>
              </ListItemIcon>
              <ListItemText inset primary="Excluir"/>
            </MenuItem>
          </MenuList>
        </Menu>
        {disableDialog()}
        {deleteDialog()}
      </React.Fragment>
    )
  }
}

const mapStateToProps = state => ({})
export default compose(connect(mapStateToProps), withDataProvider)(withStyles(styles)(ShowActions))