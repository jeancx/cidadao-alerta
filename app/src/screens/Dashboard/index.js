import { Button, Footer, FooterTab, Icon } from 'native-base'
import React from 'react'
import { createMaterialTopTabNavigator } from 'react-navigation'
import Profile from 'screens/Profile'
import ReportsMap from 'screens/ReportsMap'
import Timeline from 'screens/Timeline'
import styles from './styles'

export default createMaterialTopTabNavigator(
  { Timeline, ReportsMap, Profile },
  {
    initialRouteName: 'Timeline',
    tabBarPosition: 'bottom',
    swipeEnabled: true,
    animationEnabled: true,
    lazy: true,
    navigationOptions: {
      title: 'Cidadão Alerta'
    },
    tabBarComponent: ({ navigation }) => {
      const { navigate, state } = navigation
      const { index } = state
      const goTo = (page) => navigate(page)

      return (
        <Footer>
          <FooterTab>
            <Button active={index === 0} onPress={() => goTo('Timeline')} style={(index === 0) ? styles.line : {}}>
              <Icon name="apps"/>
            </Button>
            <Button active={index === 1} onPress={() => goTo('ReportsMap')} style={(index === 1) ? styles.line : {}}>
              <Icon name="map"/>
            </Button>
            <Button active={index === 2} onPress={() => goTo('Profile')} style={(index === 2) ? styles.line : {}}>
              <Icon name="person"/>
            </Button>
          </FooterTab>
        </Footer>
      )
    }
  }
)
