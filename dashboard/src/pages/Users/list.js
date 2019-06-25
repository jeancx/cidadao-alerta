import * as React from 'react'
import {
  Datagrid, List, Filter, TextField, TextInput, ShowButton, EditButton, EmailField
} from 'react-admin'

const UserFilter = (props) => (
  <Filter {...props}>
    <TextInput label="Nome" source="displayName" alwaysOn/>
    <TextInput label="Email" source="email" alwaysOn/>
  </Filter>
)

export const UserList = ({ permissions, ...props }) => (
  <List {...props} filters={<UserFilter/>} sort={{ field: 'displayName', order: 'DESC' }} bulkActionButtons={false}>
    <Datagrid>
      <TextField source="displayName"/>
      <EmailField source="email"/>
      <TextField source="statistics.level" label="Level"/>
      <ShowButton label=""/>
      {permissions === 'admin' && <EditButton label=""/>}
    </Datagrid>
  </List>
)
