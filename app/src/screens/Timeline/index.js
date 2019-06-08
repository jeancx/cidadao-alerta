import React from 'react'
import { connect } from 'react-redux'
import { ActivityIndicator, Alert, FlatList, InteractionManager, NetInfo } from 'react-native'
import { Body, Button, Card, CardItem, Container, Content, Fab, Icon, Left, Text, Thumbnail, Toast } from 'native-base'
import { Menu, MenuOption, MenuOptions, MenuTrigger } from 'react-native-popup-menu'
import { Image } from 'react-native-elements'

import ErrorMessages from 'constants/errors'
import Images from 'constants/images'
import Utils from 'services/utils'

import Report from 'screens/Report'
import ReportForm from 'screens/ReportForm'
import MarkSolved from 'screens/Modals/MarkSolved'
import MarkDenounced from 'screens/Modals/MarkDenounced'
import { DropDownHolder } from 'components/DropdownHolder'

import styles from './styles'
import {
  deleteReport,
  fetchCategories,
  fetchNearReports,
  fetchUser,
  reportActionTypeChange,
  resetLoading,
  saveMarkOnReport,
  shareReport
} from './actions'
import { NavigationActions } from 'react-navigation'

const ITEMS_PER_PAGE = 6

class Timeline extends React.PureComponent {
  state = {
    markSolvedIsVisible: false,
    markDenouncedIsVisible: false,
    refreshing: false,
    report: {},
    lastRefresh: null
  }

  componentDidMount () {
    InteractionManager.runAfterInteractions(async () => {
      const { resetLoading, user, navigation, fetchUser, fetchCategories, fetchNearReports } = this.props

      if (!user.isAuthenticated) navigation.reset([NavigationActions.navigate({ routeName: 'Login' })], 0)

      if (await NetInfo.isConnected.fetch()) {
        resetLoading()
        fetchUser(user)
        fetchCategories()
        fetchNearReports()
      } else {
        DropDownHolder.alert('warn', 'Sem Conexão', ErrorMessages.noConnection)
      }
    })
  }

  componentDidUpdate () {
    const { user, navigation } = this.props
    if (!user.isAuthenticated) navigation.reset([NavigationActions.navigate({ routeName: 'Login' })], 0)
  }

  refreshAndWait = async () => {
    if (!this.state.lastRefresh || ((new Date() - this.state.lastRefresh) / 1000) > 5 * 60) {
      this.refresh()
      this.setState({ lastRefresh: new Date() }, () => this.refresh())
    }
  }

  refresh = async () => {
    if (await NetInfo.isConnected.fetch()) {
      this.setState({ refreshing: true }, async () => {
        await this.props.fetchNearReports()
        this.setState({ refreshing: false })
      })
    } else {
      Toast.show({ text: ErrorMessages.noConnection, buttonText: 'OK' })
    }
  }

  supportReport = (reportId) => this.props.reportActionTypeChange(reportId, 'support', this.props.user)
  openReport = (reportId) => this.props.navigation.navigate('Report', { reportId })
  openNewReport = () => this.props.navigation.navigate('ReportForm')
  openEditReport = (report) => this.props.navigation.navigate('ReportForm', { report: report })
  getUserAvatar = (author) => author && author.photoURL ? { uri: author.photoURL } : Images.blankAvatar
  openMarkSolved = (report) => this.setState({ report, markSolvedIsVisible: true })
  closeMarkSolved = () => this.setState({ report: {}, markSolvedIsVisible: false })
  openMarkDenounced = (report) => this.setState({ report, markDenouncedIsVisible: true })
  closeMarkDenounced = () => this.setState({ report: {}, markDenouncedIsVisible: false })

  renderActionButton = (report, type) => {
    const { user, shareReport } = this.props
    const userStatistics = user.profile && user.profile.statistics ? user.profile.statistics : {}
    const done = Array.isArray(userStatistics[type]) ? userStatistics[type].indexOf(report.id) !== -1 : false
    const buttons = {
      support: { iconDone: 'heart', iconNotDone: 'heart-outline', onPress: () => this.supportReport(report.id) },
      comment: { iconDone: 'comment', iconNotDone: 'comment-outline', onPress: () => this.openReport(report.id) },
      share: { iconDone: 'share', iconNotDone: 'share-outline', onPress: () => shareReport(report, user) },
    }
    const actionIcon = (type) => done ? buttons[type].iconDone : buttons[type].iconNotDone
    const iconType = 'MaterialCommunityIcons'

    return (
      <Button iconLeft transparent onPress={buttons[type].onPress}>
        <Icon name={actionIcon(type)} type={iconType}/>
        <Text>({report.statistics && report.statistics[type] > 0 ? report.statistics[type] : 0})</Text>
      </Button>
    )
  }

  deleteReport = (report, uid) => {
    Alert.alert(
      Utils.limitText(report.description, 30),
      'Deseja excluir este Relato permanentemente?',
      [
        { text: 'Confirmar', onPress: () => this.props.deleteReport(report.id, uid) },
        { text: 'Cancelar', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
      ],
      { cancelable: true }
    )
  }

  renderMenu = (report) => {
    const { uid } = this.props.user

    return (
      <Menu>
        <MenuTrigger>
          <Icon name="more" style={{ margin: 5, padding: 5, color: '#5067FF' }}/>
        </MenuTrigger>
        <MenuOptions>
          <MenuOption onSelect={() => this.openMarkSolved(report)} text="Marcar como Resolvido"/>
          <MenuOption onSelect={() => this.openMarkDenounced(report)} text={'Denunciar'}/>
          {report.userId === uid && (<MenuOption onSelect={() => this.openEditReport(report)} text={'Editar'}/>)}
          {report.userId === uid && (<MenuOption onSelect={() => this.deleteReport(report, uid)} text={'Deletar'}/>)}
        </MenuOptions>
      </Menu>
    )
  }

  renderReport = (item) => {
    const report = item.item

    return (
      <Card key={report.id} style={{ marginBottom: (item.index + 1 === this.props.reports.length ? 100 : 0) }}>
        <CardItem bordered>
          <Left>
            <Thumbnail source={this.getUserAvatar(report.author)}/>
            <Body>
              <Text>{Utils.limitText(report.description, 30)}</Text>
              <Text note>{report.author && report.author.displayName ? report.author.displayName : ''}</Text>
            </Body>
          </Left>
        </CardItem>
        <CardItem cardBody button onPress={() => this.openReport(report.id)}
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }} activeOpacity={1}>
          <Image source={{ uri: report.pictures[0] }} style={styles.img} PlaceholderContent={<ActivityIndicator/>}/>
        </CardItem>
        <CardItem bordered>
          {this.renderActionButton(report, 'support')}
          {this.renderActionButton(report, 'comment')}
          {this.renderActionButton(report, 'share')}
          {this.renderMenu(report)}
        </CardItem>
      </Card>
    )
  }

  renderFooter = () => (this.state.refreshing ? <ActivityIndicator/> : null)

  render () {
    const { reports, user, saveMarkOnReport } = this.props
    const { refreshing, newReportIsVisible, markSolvedIsVisible, markDenouncedIsVisible, report } = this.state

    return (
      <Container>
        <Content behavior="padding" style={{ flex: 1 }} contentContainerStyle={{ flex: 1 }}>

          {!reports || reports.length === 0 ? (
            <Content padder>
              <Card transparent>
                <CardItem>
                  <Body>
                    <Text>
                      Seja bem vindo!

                      Quer ser o primeiro à relatar um problema na sua região?
                    </Text>
                  </Body>
                </CardItem>
              </Card>
            </Content>
          ) : (
            <FlatList
              data={reports}
              initialNumToRender={ITEMS_PER_PAGE}
              onEndReachedThreshold={0.1}
              refreshing={refreshing}
              renderItem={this.renderReport}
              keyExtractor={item => item.id}
              onEndReached={this.refreshAndWait}
              ListFooterComponent={this.renderFooter}
              onRefresh={this.refresh}
            />
          )}

          <Fab style={styles.addButton} position="bottomRight" onPress={this.openNewReport}>
            <Icon name="add" style={{ color: 'white' }}/>
          </Fab>

          <MarkSolved visible={markSolvedIsVisible} user={user} report={report} save={saveMarkOnReport}
                      close={this.closeMarkSolved}/>
          <MarkDenounced visible={markDenouncedIsVisible} user={user} report={report} save={saveMarkOnReport}
                         close={this.closeMarkDenounced}/>
        </Content>
      </Container>
    )
  }

  static defaultProps = {
    reports: []
  }
}

const mapStateToProps = state => ({
  user: state.user,
  reports: state.reports.list
})
const mapDispatchToProps = {
  fetchNearReports, reportActionTypeChange, shareReport, deleteReport,
  saveMarkOnReport, fetchCategories, fetchUser, resetLoading
}

export default connect(mapStateToProps, mapDispatchToProps)(Timeline)
