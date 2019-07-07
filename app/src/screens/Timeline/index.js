import { DropDownHolder } from 'components/DropdownHolder'
import Popup from 'components/Popup'
import ErrorMessages from 'constants/errors'
import { Body, Card, CardItem, Container, Content, Fab, Icon, Text, Thumbnail, Toast } from 'native-base'
import React from 'react'
import { ActivityIndicator, FlatList, InteractionManager, NetInfo } from 'react-native'
import { NavigationActions } from 'react-navigation'
import { connect } from 'react-redux'
import ReportForm from 'screens/ReportForm'
import Utils from 'services/utils'
import {
  answerReport, deleteReport, fetchCategories, fetchNearReports, fetchUser, reportActionTypeChange, resetLoading,
  saveMarkOnReport, shareReport
} from './actions'
import ReportCard from './ReportCard'
import styles from './styles'

const ITEMS_PER_PAGE = 6

class Timeline extends React.PureComponent {
  state = {
    popupVisible: false,
    markSolvedVisible: false,
    markDenouncedVisible: false,
    refreshing: false,
    report: {},
    lastRefresh: null,
    answerReport: null,
    answered: false
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
    const { user, navigation, reports, answers } = this.props
    const { popupVisible, answered } = this.state
    if (!user.isAuthenticated) {
      navigation.reset([NavigationActions.navigate({ routeName: 'Login' })], 0)
    }

    if (reports && !answered && !popupVisible) {
      reports.forEach(report => {
        if (!answers[report.id] && report.distance <= 25) {
          this.setState({ answerReport: report, popupVisible: true, answered: true })
        }
      })
    }
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

  openNewReport = () => this.props.navigation.navigate('ReportForm')
  closePopup = () => {
    this.props.answerReport(this.state.answerReport.id)
    this.setState({ popupVisible: false, answerReport: null })
  }

  markSolved = () => {
    const { answerReport } = this.state
    this.props.saveMarkOnReport('solved', answerReport, {}, this.props.user)
    this.closePopup()
  }

  renderAnswerReport = () => {
    const report = this.state.answerReport
    if (report) {
      return (
        <React.Fragment>
          <Thumbnail
            square
            large
            source={{ uri: report.pictures[0] }}
            style={{ marginRight: 5, flex: 30 }}
          />
          <Text style={{ flex: 70 }}>
            <Text style={{ fontWeight: 'bold' }}>Este relato foi resolvido?{'\n'}</Text>
            <Text>{Utils.limitText(report.description, 30)}</Text>
          </Text>
        </React.Fragment>
      )
    } else {
      return (<React.Fragment/>)
    }
  }

  renderFooter = () => (this.state.refreshing ? <ActivityIndicator/> : null)

  render () {
    const { reports } = this.props
    const { refreshing, popupVisible } = this.state

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
              renderItem={({ item }) => (<ReportCard report={item}/>)}
              keyExtractor={item => item.id}
              onEndReached={this.refreshAndWait}
              ListFooterComponent={this.renderFooter}
              onRefresh={this.refresh}
            />
          )}

          <Fab style={styles.addButton} position="bottomRight" onPress={this.openNewReport}>
            <Icon name="add" style={{ color: 'white' }}/>
          </Fab>

          <Popup
            visible={popupVisible}
            confirmTitle="Sim"
            cancelTitle="Não"
            close={this.closePopup}
            cancel={this.closePopup}
            confirm={this.markSolved}
          >
            {this.renderAnswerReport()}
          </Popup>
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
  reports: state.reports.list,
  answers: state.reports.answers
})
const mapDispatchToProps = {
  fetchNearReports, reportActionTypeChange, shareReport, deleteReport,
  saveMarkOnReport, fetchCategories, fetchUser, resetLoading, answerReport
}

export default connect(mapStateToProps, mapDispatchToProps)(Timeline)
