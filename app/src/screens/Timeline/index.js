import DropDownHolder from 'components/DropdownHolder'
import Popup from 'components/Popup'
import ErrorMessages from 'constants/errors'
import { Body, Card, CardItem, Container, Content, Fab, Icon, Text, Thumbnail, Toast } from 'native-base'
import PropTypes from 'prop-types'
import React from 'react'
import { ActivityIndicator, FlatList, InteractionManager, NetInfo } from 'react-native'
import { NavigationActions } from 'react-navigation'
import { connect } from 'react-redux'
import Utils from 'services/utils'
import * as actions from './actions'
import ReportCard from './ReportCard'
import styles from './styles'

const ITEMS_PER_PAGE = 6

class Timeline extends React.PureComponent {
  state = {
    popupVisible: false,
    refreshing: false,
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
    const { fetchNearReports } = this.props

    if (await NetInfo.isConnected.fetch()) {
      this.setState({ refreshing: true }, async () => {
        await fetchNearReports()
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
    const { saveMarkOnReport, user } = this.props
    saveMarkOnReport('solved', answerReport, {}, user)
    this.closePopup()
  }

  renderAnswerReport = () => {
    const { answerReport } = this.state
    if (answerReport) {
      return (
        <React.Fragment>
          <Thumbnail
            square
            large
            source={{ uri: answerReport.pictures[0] }}
            style={{ marginRight: 5, flex: 30 }}
          />
          <Text style={{ flex: 70 }}>
            <Text style={{ fontWeight: 'bold' }}>Este relato foi resolvido?{'\n'}</Text>
            <Text>{Utils.limitText(answerReport.description, 30)}</Text>
          </Text>
        </React.Fragment>
      )
    }
    return (<React.Fragment/>)
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
}

Timeline.defaultProps = {
  reports: []
}

Timeline.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  reports: PropTypes.array,
  answers: PropTypes.array.isRequired,
  resetLoading: PropTypes.func.isRequired,
  user: PropTypes.object.isRequired,
  navigation: PropTypes.object.isRequired,
  fetchUser: PropTypes.func.isRequired,
  saveMarkOnReport: PropTypes.func.isRequired,
  fetchCategories: PropTypes.func.isRequired,
  answerReport: PropTypes.func.isRequired,
  fetchNearReports: PropTypes.func.isRequired
}

const mapStateToProps = state => ({
  user: state.user,
  reports: state.reports.list,
  answers: state.reports.answers
})
const mapDispatchToProps = {
  fetchNearReports: actions.fetchNearReports,
  reportActionTypeChange: actions.reportActionTypeChange,
  shareReport: actions.shareReport,
  deleteReport: actions.deleteReport,
  saveMarkOnReport: actions.saveMarkOnReport,
  fetchCategories: actions.fetchCategories,
  fetchUser: actions.fetchUser,
  resetLoading: actions.resetLoading,
  answerReport: actions.answerReport
}

export default connect(mapStateToProps, mapDispatchToProps)(Timeline)
