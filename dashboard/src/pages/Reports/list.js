import * as React from 'react'
import { Datagrid, Filter, List, ShowButton, TextField, TextInput } from 'react-admin'

const ReportFilter = (props) => (
  <Filter {...props}>
    <TextInput label="Categoria" source="category.name" alwaysOn/>
    <TextInput label="Subcategoria" source="subcategory.name" alwaysOn/>
    <TextInput label="Descrição" source="description" alwaysOn/>
    <TextInput label="Usuário" source="author.displayName" alwaysOn/>
    <TextInput label="Cidade" source="address.city" alwaysOn/>
  </Filter>
)

export const ReportList = (props) => {
  return (
    <List {...props} filters={<ReportFilter/>} sort={{ field: 'displayName', order: 'DESC' }} bulkActionButtons={false}>
      <Datagrid>
        <TextField source="category.name" label="Categoria"/>
        <TextField source="subcategory.name" label="Subcategoria"/>
        <TextField source="description" label="Descrição"/>
        <TextField source="author.displayName" label="Usuário"/>
        <TextField source="address.city" label="Cidade"/>
        <TextField source="statistics.solved" label="🤚"/>
        <ShowButton label=""/>
      </Datagrid>
    </List>
  )
}