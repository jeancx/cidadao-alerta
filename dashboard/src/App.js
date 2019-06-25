import portugueseMessages from 'ra-language-portuguese'
import * as React from 'react'
import { Admin, Resource } from 'react-admin'
import './App.css'
import { authProvider, dataProvider } from './config/providers'
import { Layout, Login } from './layout'
import Dashboard from './pages/Dashboard'
import reports from './pages/Reports'
import users from './pages/Users'
import customRoutes from './routes'

const messages = { 'pt': portugueseMessages }
const i18nProvider = locale => messages[locale]

class App extends React.PureComponent {
  render () {
    return (
      <Admin
        title="Cidadão Alerta"
        loginPage={Login}
        dashboard={Dashboard}
        dataProvider={dataProvider}
        authProvider={authProvider}
        appLayout={Layout}
        locale="pt"
        i18nProvider={i18nProvider}
        customRoutes={customRoutes}
      >
        <Resource name="users" options={{ label: 'Usuários' }} {...users}/>
        <Resource name="reports" options={{ label: 'Relatos' }} {...reports}/>
      </Admin>
    )
  }
}

export default App
