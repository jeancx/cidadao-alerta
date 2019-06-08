import { createStackNavigator } from 'react-navigation'

import Login from 'screens/Login'
import Dashboard from 'screens/Dashboard'
import Register from 'screens/Register'
import Report from 'screens/Report'
import ReportForm from 'screens/ReportForm'

const rootStack = createStackNavigator(
  { Dashboard, Login, Register, Report, ReportForm },
  {
    initialRouteName: 'Login',
    defaultNavigationOptions: {
      headerStyle: {
        height: 50,
        backgroundColor: '#3F51B5',
        borderBottomWidth: 0,
        borderBottomColor: '#3F51B5',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 1.2
      },
      headerTintColor: '#F5FCFF'
    }
  }
)

export default rootStack
