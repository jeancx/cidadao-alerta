import Images from 'constants/images'
import { Body, Button, Card, CardItem, Icon, Left, Text, Thumbnail } from 'native-base'
import React from 'react'
import { ActivityIndicator, Alert } from 'react-native'
import { Image } from 'react-native-elements'
import { Menu, MenuOption, MenuOptions, MenuTrigger } from 'react-native-popup-menu'
import { withNavigation } from 'react-navigation'
import { connect } from 'react-redux'
import MarkDenounced from 'screens/Modals/MarkDenounced'
import MarkSolved from 'screens/Modals/MarkSolved'
import Report from 'screens/Report'
import ReportForm from 'screens/ReportForm'
import Utils from 'services/utils'
import { answerReport, deleteReport, reportActionTypeChange, saveMarkOnReport, shareReport } from '../actions'
import styles from './styles'

class ReportCard extends React.PureComponent {
  state = {
    markSolvedVisible: false,
    markDenouncedVisible: false,
    answerReport: null,
    answered: false
  }

  supportReport = (reportId) => this.props.reportActionTypeChange(reportId, 'support', this.props.user)
  openReport = (reportId) => this.props.navigation.navigate('Report', { reportId })
  openEditReport = (report) => this.props.navigation.navigate('ReportForm', { report: report })
  getUserAvatar = (author) => author && author.photoURL ? { uri: author.photoURL } : Images.blankAvatar
  openMarkSolved = (report) => this.setState({ report, markSolvedVisible: true })
  closeMarkSolved = () => this.setState({ report: {}, markSolvedVisible: false })
  openMarkDenounced = (report) => this.setState({ report, markDenouncedVisible: true })
  closeMarkDenounced = () => this.setState({ report: {}, markDenouncedVisible: false })

  renderActionButton = (report, type) => {
    const { user, shareReport } = this.props
    const userStatistics = user.profile && user.profile.statistics ? user.profile.statistics : {}
    const done = Array.isArray(userStatistics[type]) ? userStatistics[type].indexOf(report.id) !== -1 : false
    const buttons = {
      support: {
        iconDone: 'heart',
        iconNotDone: 'heart-outline',
        onPress: () => this.supportReport(report.id),
        title: 'Suportar'
      },
      comment: {
        iconDone: 'comment',
        iconNotDone: 'comment-outline',
        onPress: () => this.openReport(report.id),
        title: 'Comentar'
      },
      share: {
        iconDone: 'share',
        iconNotDone: 'share-outline',
        onPress: () => shareReport(report, user),
        title: 'Compartilhar'
      }
    }

    const actionIcon = (type) => done ? buttons[type].iconDone : buttons[type].iconNotDone
    const iconType = 'MaterialCommunityIcons'

    return (
      <Button iconLeft transparent onPress={buttons[type].onPress} title={buttons[type].title}>
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
        { text: 'Cancelar', onPress: () => console.log('Cancel Pressed'), style: 'cancel' }
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

  render () {
    const { report, user, saveMarkOnReport } = this.props
    const { markSolvedVisible, markDenouncedVisible } = this.state

    return (
      <React.Fragment>
        <Card>
          <CardItem bordered>
            <Left>
              <Thumbnail source={this.getUserAvatar(report.author)}/>
              <Body>
                <Text>{Utils.limitText(report.description, 30)}</Text>
                <Text note>{report.author && report.author.displayName ? report.author.displayName : ''}</Text>
              </Body>
            </Left>
          </CardItem>
          <CardItem
            cardBody
            button
            onPress={() => this.openReport(report.id)}
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
            activeOpacity={1}
          >
            <Image source={{ uri: report.pictures[0] }} style={styles.img} PlaceholderContent={<ActivityIndicator/>}/>
          </CardItem>
          <CardItem bordered>
            {this.renderActionButton(report, 'support')}
            {this.renderActionButton(report, 'comment')}
            {this.renderActionButton(report, 'share')}
            {this.renderMenu(report)}
          </CardItem>
        </Card>

        <MarkSolved
          visible={markSolvedVisible}
          user={user}
          report={report}
          save={saveMarkOnReport}
          close={this.closeMarkSolved}
        />
        <MarkDenounced
          visible={markDenouncedVisible}
          user={user} report={report}
          save={saveMarkOnReport}
          close={this.closeMarkDenounced}
        />
      </React.Fragment>
    )
  }

  static defaultProps = {
    report: {}
  }
}

const mapStateToProps = state => ({
  user: state.user,
  answers: state.reports.answers
})
const mapDispatchToProps = {
  reportActionTypeChange, shareReport, deleteReport, saveMarkOnReport, answerReport
}

export default connect(mapStateToProps, mapDispatchToProps)(withNavigation(ReportCard))
