import {
  Avatar, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, IconButton, Input,
  List, ListItem, ListItemIcon, ListItemSecondaryAction, ListItemText, withStyles
} from '@material-ui/core'
import {
  Check as ConfirmIcon, CheckCircle, Close as CancelIcon, Delete as DeleteIcon, Send as SendIcon
} from '@material-ui/icons'
import React from 'react'
import {
  BooleanField, DateField, GET_LIST, ImageField, RichTextField, Show, Tab, TabbedShowLayout, TextField, withDataProvider
} from 'react-admin'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import avatar from '../../assets/images/user.png'
import { API } from '../../providers/api'
import ShowActions from './actions'

const styles = theme => ({
  container: {
    display: 'flex',
    flexWrap: 'wrap'
  },
  button: {
    color: 'white'
  },
  image: {
    height: 100,
    paddingRight: 5
  },
  actionIcon: {
    marginRight: 10
  }
})

class ReportShow extends React.PureComponent {
  state = {
    auth: {},
    comments: [],
    solveds: [],
    denounces: [],
    mark: {},
    comment: {},
    commentText: '',
    confirmMarkDialog: false,
    rejectMarkDialog: false,
    deleteDialog: false,
    disableDialog: false,
    reason: ''
  }

  componentDidMount () {
    this.fetchComments()
    this.fetchMarks()
  }

  fetchComments = () => {
    const { dataProvider, id } = this.props

    dataProvider(
      GET_LIST,
      [{ type: 'collection', value: 'reports' }, { type: 'doc', value: id }, { type: 'collection', value: 'comments' }],
      { filter: {}, sort: { field: 'createdAt', order: 'DESC' } })
      .then(({ data: comments }) => this.setState({ comments }))
  }

  fetchMarks = () => {
    const { dataProvider, id } = this.props

    dataProvider(
      GET_LIST,
      [{ type: 'collection', value: 'reports' }, { type: 'doc', value: id }, { type: 'collection', value: 'marks' }],
      { filter: {}, sort: { field: 'createdAt', order: 'DESC' } }
    ).then(({ data: marks }) => {
      this.setState({ solveds: marks.filter(mark => mark.type === 'solved') })
      this.setState({ denounces: marks.filter(mark => mark.type === 'denounced') })
    })
  }

  onInputChange = (event) => {
    const { name, value } = event.target
    this.setState({ [name]: value })
  }

  confirmDeleteComment = () => {
    API.delete('/comments/' + this.state.comment.id, { reason: this.state.reason, action: 'delete' })
      .then(() => {
        this.fetchComments()
        this.setState({ deleteDialog: false, comment: {}, reason: '' })
      })
  }

  deleteCommentDialog = () => {
    const { classes } = this.props
    const { deleteDialog } = this.state

    return (
      <Dialog open={deleteDialog} onClose={() => this.setState({ deleteDialog: false })}>
        <DialogTitle>
          Deseja <span style={{ color: 'red' }}>EXCLUIR</span> este comentário?
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {this.state.comment.text}
            <br/>
            <br/>
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
          <Button onClick={this.confirmDeleteComment} color="secondary">
            <ConfirmIcon className={classes.button}/> Confirmar
          </Button>
          <Button onClick={() => this.setState({ deleteDialog: false })} color="default">
            <CancelIcon className={classes.button}/> Cancelar
          </Button>
        </DialogActions>
      </Dialog>
    )
  }

  saveMark = (accepted) => {
    API.post('marks', { markId: this.state.mark.id, accepted: accepted })
  }

  confirmMark = () => {
    this.saveMark(true)
      .then(() => this.fetchMarks())
      .then(() => this.setState({ confirmMarkDialog: false, mark: {}, reason: '' }))
  }

  confirmMarkDialog = () => {
    const { classes } = this.props
    const { confirmMarkDialog, mark } = this.state

    return (
      <Dialog open={confirmMarkDialog} onClose={() => this.setState({ confirmMarkDialog: false })}>
        <DialogTitle>
          Deseja <span style={{ color: 'green' }}>APROVAR</span> esta marcação como:
          <span style={{ color: mark.type === 'solved' ? 'green' : 'red' }}>
            {`${mark.type === 'solved' ? ' RESOLVIDO' : ' DENUNCIADO'}`}
          </span>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>{mark.description}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={this.confirmMark} color="primary">
            <ConfirmIcon className={classes.button}/> Confirmar
          </Button>
          <Button onClick={() => this.setState({ confirmMarkDialog: false })} color="default">
            <CancelIcon className={classes.button}/> Cancelar
          </Button>
        </DialogActions>
      </Dialog>
    )
  }

  rejectMark = () => {
    this.saveMark(false)
      .then(() => this.fetchMarks())
      .then(() => this.setState({ rejectMarkDialog: false, mark: {}, reason: '' }))
  }

  rejectMarkDialog = () => {
    const { classes } = this.props
    const { rejectMarkDialog, mark } = this.state

    return (
      <Dialog open={rejectMarkDialog} onClose={() => this.setState({ rejectMarkDialog: false })}>
        <DialogTitle>
          Deseja <span style={{ color: 'red' }}>REJEITAR</span> esta marcação como:
          <span style={{ color: mark.type === 'solved' ? 'green' : 'red' }}>
            {`${mark.type === 'solved' ? ' RESOLVIDO' : ' DENUNCIADO'}`}
          </span>
        </DialogTitle>
        <DialogContent><DialogContentText>{mark.description}</DialogContentText></DialogContent>
        <DialogActions>
          <Button onClick={this.rejectMark} color="secondary">
            <ConfirmIcon className={classes.button}/> Confirmar
          </Button>
          <Button onClick={() => this.setState({ rejectMarkDialog: false })} color="default">
            <CancelIcon className={classes.button}/> Cancelar
          </Button>
        </DialogActions>
      </Dialog>
    )
  }

  saveComment = () => {
    API.post('/comments', { reportId: this.props.id, type: 'add', text: this.state.commentText })
  }

  render () {
    const { confirmMarkDialog, rejectMarkDialog, deleteCommentDialog } = this
    const { classes, dispatch, dataProvider, ...props } = this.props
    const permissions = this.props.permissions
    const { comments, solveds, denounces } = this.state

    return (
      <Show {...props} title="Relato" actions={(<ShowActions id={this.props.id}/>)}>
        <TabbedShowLayout>
          <Tab label="Detalhes">
            <ImageField source="pictures[0]" label="Foto 1"/>
            <ImageField source="pictures[1]" label="Foto 2"/>
            <ImageField source="pictures[2]" label="Foto 3"/>
            <RichTextField source="description" label="Descrição"/>
            <RichTextField source="category.name" label="Categoria"/>
            <RichTextField source="subcategory.name" label="Subcategoria"/>
            <DateField source="createdAt" showTime locales="pt-BR" label="Criado em"/>
            <DateField source="updatedAt" showTime locales="pt-BR" label="Atualizado em"/>
            <BooleanField source="active" label="Ativo"/>
          </Tab>
          <Tab label="Estatisticas">
            <TextField source="statistics.support" label="Apoios"/>
            <TextField source="comments.length" label="Comentários"/>
            <TextField source="statistics.share" label="Compartilhamentos"/>
            <TextField source="statistics.solved" label="Marcações como resolvido"/>
            <TextField source="statistics.denounced" label="Denúncias"/>
          </Tab>
          <Tab label={`Comentários (${comments.length})`}>
            <List>
              {comments.map((comment) =>
                <ListItem key={comment.id} dense button>
                  <Avatar alt={comment.author.displayName} src={comment.author.photoURL}/>
                  <ListItemText primary={comment.author.displayName} secondary={comment.text}/>
                  {permissions && (permissions.admin || permissions.superadmin) && (
                    <ListItemSecondaryAction>
                      <IconButton aria-label="Deletar comentário" color="secondary"
                                  onClick={() => this.setState({ deleteDialog: true, comment })}>
                        <DeleteIcon/>
                      </IconButton>
                    </ListItemSecondaryAction>
                  )}
                </ListItem>
              )}
              <Divider/>
              {(permissions && permissions.prefecture) && (
                <ListItem dense button style={{ marginTop: 10 }}>
                  <Avatar alt={''} src={avatar}/>
                  <ListItemText>
                    <Input
                      name="commentText"
                      rows={10}
                      placeholder="Responda o cidadão que relatou o problema, aqui..."
                      fullWidth
                      onChange={this.onInputChange}
                    />
                  </ListItemText>
                  <ListItemSecondaryAction>
                    <IconButton aria-label="Enviar Resposta" onClick={this.saveComment}>
                      <SendIcon/>
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              )}
            </List>
            {permissions && (permissions.admin || permissions.superadmin) && deleteCommentDialog()}
          </Tab>
          <Tab label={`Resolvidos (${solveds.length})`}>
            <List>
              {solveds.map((item) =>
                <ListItem key={item.id} dense button>
                  <Avatar alt={item.author.displayName} src={item.author.photoURL}/>
                  <ListItemText primary={item.author.displayName} secondary={item.description}/>
                  <ListItemIcon style={{ paddingRight: 50 }}>
                    <div>
                      <img src={item.pictures[0]} className={classes.image} alt="Foto 1"/>
                      {item.pictures[1] && (<img src={item.pictures[1]} className={classes.image} alt="Foto 2"/>)}
                      {item.pictures[2] && (<img src={item.pictures[2]} className={classes.image} alt="Foto 3"/>)}
                    </div>
                  </ListItemIcon>
                  {!item.acceptedAt && (
                    <ListItemIcon>
                      <Button variant="contained" color="primary" type="button" className={classes.button}
                              onClick={() => this.setState({ confirmMarkDialog: true, mark: item })}>
                        <ConfirmIcon className={classes.actionIcon}/> Aprovar
                      </Button>
                    </ListItemIcon>
                  )}
                  {!item.acceptedAt && (
                    <ListItemIcon>
                      <Button variant="contained" color="secondary" type="button" className={classes.button}
                              onClick={() => this.setState({ rejectMarkDialog: true, mark: item })}>
                        <CancelIcon className={classes.actionIcon}/> Rejeitar
                      </Button>
                    </ListItemIcon>
                  )}
                  {item.acceptedAt && (
                    <ListItemIcon>
                      <Button variant="contained" color="default" type="button" className={classes.button}>
                        <CheckCircle className={classes.actionIcon}/> Aprovado
                      </Button>
                    </ListItemIcon>
                  )}
                </ListItem>
              )}
            </List>
            {confirmMarkDialog()}
            {rejectMarkDialog()}
          </Tab>
          <Tab label={`Denúncias (${denounces.length})`}>
            <List>
              {denounces.map((item) =>
                <ListItem key={item.id} dense button>
                  <Avatar alt={item.author.displayName} src={item.author.photoURL}/>
                  <ListItemText primary={item.author.displayName} secondary={item.description}/>
                  {!item.acceptedAt && (
                    <ListItemIcon>
                      <Button variant="contained" color="primary" type="button" className={classes.button}
                              onClick={() => this.setState({ confirmMarkDialog: true, mark: item })}>
                        <ConfirmIcon className={classes.actionIcon}/> Aprovar
                      </Button>
                    </ListItemIcon>
                  )}
                  {!item.acceptedAt && (
                    <ListItemIcon>
                      <Button variant="contained" color="secondary" type="button" className={classes.button}
                              onClick={() => this.setState({ rejectMarkDialog: true, mark: item })}>
                        <CancelIcon className={classes.actionIcon}/> Rejeitar
                      </Button>
                    </ListItemIcon>
                  )}
                  {item.acceptedAt && (
                    <ListItemIcon>
                      <Button variant="contained" color="default" type="button" className={classes.button}>
                        <CheckCircle className={classes.actionIcon}/> Aprovado
                      </Button>
                    </ListItemIcon>
                  )}
                </ListItem>
              )}
              <Divider/>
            </List>
            {confirmMarkDialog()}
            {rejectMarkDialog()}
          </Tab>
        </TabbedShowLayout>
      </Show>
    )
  }
}

const mapStateToProps = state => ({})
export default compose(connect(mapStateToProps), withDataProvider)(withStyles(styles)(ReportShow))
