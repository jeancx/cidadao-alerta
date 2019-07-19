import rootStack from 'app/navigator'
import configureStore from 'app/store'
import getTheme from 'assets/native-base-theme/components'
import theme from 'assets/native-base-theme/variables/commonColor'
import DropDownHolder from 'components/DropdownHolder'
import { AppLoading, Font } from 'expo'
import { StyleProvider } from 'native-base'
import React from 'react'
import DropdownAlert from 'react-native-dropdownalert'
import { ThemeProvider } from 'react-native-elements'
import { MenuProvider } from 'react-native-popup-menu'
import { createAppContainer } from 'react-navigation'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/es/integration/react'

const { persistor, store } = configureStore()
const AppContainer = createAppContainer(rootStack)
console.disableYellowBox = true

export default class App extends React.PureComponent {
  state = { isReady: false }

  loadResourcesAsync = async () => {
    await Font.loadAsync({
      Roboto: require('native-base/Fonts/Roboto.ttf'),
      Roboto_medium: require('native-base/Fonts/Roboto_medium.ttf'),
      Ionicons: require('@expo/vector-icons/fonts/Ionicons.ttf'),
      Questrial: require('assets/fonts/Questrial-Regular.ttf')
    })

    this.setState({ isReady: true })
  }

  render () {
    if (!this.state.isReady) {
      return (
        <AppLoading
          startAsync={this.loadResourcesAsync}
          onFinish={() => this.setState({ isReady: true })}
          onError={console.warn}
        />
      )
    }

    return (
      <Provider store={store}>
        <DropdownAlert
          ref={ref => DropDownHolder.setDropDown(ref)}
          defaultContainer={{ padding: 8, paddingTop: 30, flexDirection: 'row' }}
        />
        <PersistGate persistor={persistor}>
          <StyleProvider style={getTheme(theme)}>
            <ThemeProvider>
              <MenuProvider>
                <AppContainer/>
              </MenuProvider>
            </ThemeProvider>
          </StyleProvider>
        </PersistGate>
      </Provider>
    )
  }
}
