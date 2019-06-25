import { Button, Checkbox, Chip, FormControlLabel, FormGroup, withStyles } from '@material-ui/core'
import { Link as LinkIcon, Save as SaveIcon } from '@material-ui/icons'
import React from 'react'
import {
  BooleanField, DateField, GET_ONE, ImageField, Show, Tab, TabbedShowLayout, TextField, UPDATE, withDataProvider
} from 'react-admin'
import { connect } from 'react-redux'
import compose from 'recompose/compose'

const UserTitle = (props) => (<span>Usuário: {props.record ? props.record.displayName : ''}</span>)
const Reports = ({ record }) => {
  return (
    <div style={{ paddingTop: 20 }}>
      {record.statistics.report.map(item => (
        <a href={`#/reports/${item}/show`}>
          <Chip key={item} avatar={<LinkIcon/>} label={item} style={{ padding: 5 }}/>
        </a>
      ))}
    </div>
  )
}
const PermissionsCheckbox = ({ id, roles, onChange }) => (
  <Checkbox id={id} checked={roles[id]} value={roles[id].toString()} onChange={onChange}/>
)
const PermissionsForm = ({ classes, handleCheck, roles, saveRoles, permissions }) => {
  return (
    <FormGroup>
      <FormControlLabel
        control={<PermissionsCheckbox id="moderator" roles={roles} onChange={handleCheck}/>}
        label="Moderador"
      />
      <FormControlLabel
        control={<PermissionsCheckbox id="prefecture" roles={roles} onChange={handleCheck}/>}
        label="Prefeitura"
      />
      <FormControlLabel
        control={<PermissionsCheckbox id="admin" roles={roles} onChange={handleCheck}/>}
        label="Administrador"
      />
      {permissions.superadmin && (
        <FormControlLabel
          control={<PermissionsCheckbox id="superadmin" roles={roles} onChange={handleCheck}/>}
          label="Super Administrador"
        />
      )}

      <Button variant="contained" color="primary" className={classes.button} onClick={saveRoles}>
        <SaveIcon className={classes.leftIcon}/> Salvar
      </Button>
    </FormGroup>
  )
}

const styles = theme => ({
  button: {
    maxWidth: 180
  },
  leftIcon: {
    marginRight: theme.spacing.unit
  }
})

class UsersShow extends React.PureComponent {
  constructor (props) {
    super(props)
    this.state = { roles: { moderator: false, prefecture: false, admin: false, superadmin: false } }
    this.handleCheck = this.handleCheck.bind(this)
    this.saveRoles = this.saveRoles.bind(this)
  }

  componentDidMount () {
    this.fetchRoles()
  }

  async fetchRoles () {
    const { data: roles } = await this.props.dataProvider(GET_ONE, 'roles', { id: this.props.id })
    if (roles) this.setState({ roles })
  }

  async saveRoles () {
    const { roles } = this.state
    await this.props.dataProvider(UPDATE, 'roles', { id: this.props.id, data: roles })
  }

  handleCheck (event, value) {
    const field = event.target.id
    this.setState(({ roles }) => ({ roles: { ...roles, [field]: value } }))
  }

  render () {
    const { roles } = this.state
    const { classes, permissions, dispatch, dataProvider, ...props } = this.props

    return (
      <Show {...props} title={<UserTitle/>}>
        <TabbedShowLayout>
          <Tab label="Cadastro">
            <ImageField source="photoURL" title="displayName" label="Avatar"/>
            <TextField source="displayName" label="Nome"/>
            <TextField source="email"/>
            <TextField source="phoneNumber" label="Celular"/>
            <DateField source="createdAt" showTime locales="pt-BR" label="Criado em:"/>
            <DateField source="updatedAt" showTime locales="pt-BR" label="Atualizado em:"/>
            <BooleanField source="active" label="Ativo"/>
          </Tab>
          <Tab label="Estatisticas">
            <TextField source="statistics.level" label="Level"/>
            <TextField source="statistics.experience" label="Experiência"/>
            <TextField source="statistics.trophy.length" label="Troféus"/>
            <TextField source="statistics.report.length" label="Relatos"/>
            <TextField source="statistics.support.length" label="Apoios"/>
            <TextField source="statistics.comment.length" label="Comentários"/>
            <TextField source="statistics.share.length" label="Compartilhamentos"/>
            <TextField source="statistics.solved.length" label="Marcações como resolvido"/>
          </Tab>
          <Tab label="Relatos">
            <Reports/> }
          </Tab>
          {roles && permissions && (permissions.superadmin || permissions.admin) && (
            <Tab label="Nível de Acesso">
              <PermissionsForm
                classes={classes}
                handleCheck={this.handleCheck}
                roles={roles}
                saveRoles={this.saveRoles}
                permissions={permissions}
              />
            </Tab>
          )}
        </TabbedShowLayout>
      </Show>
    )
  }
}

const mapStateToProps = state => ({})

export default compose(connect(mapStateToProps), withDataProvider)(withStyles(styles)(UsersShow))