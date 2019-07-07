import Loading from 'components/Loading'
import Timeago from 'components/Timeago'
import Images from 'constants/images'
import { MapView } from 'expo'
import {
  Badge, Body, Button, Card, CardItem, Container, Content, Header, Icon, Left, List, ListItem, Right, Text, Thumbnail,
  Title
} from 'native-base'
import React from 'react'
import {
  Alert, Image, InteractionManager, KeyboardAvoidingView, ListView, Modal, RefreshControl, TextInput, TouchableOpacity,
  View
} from 'react-native'
import HeaderImageScrollView from 'react-native-image-header-scroll-view'
import Lightbox from 'react-native-lightbox'
import { Menu, MenuOption, MenuOptions, MenuTrigger } from 'react-native-popup-menu'
import Swiper from 'react-native-swiper'
import { connect } from 'react-redux'
import { deleteReport, reportActionTypeChange, saveMarkOnReport, shareReport } from 'screens/Timeline/actions'
import Utils from 'services/utils'
import EditComment from '../Modals/EditComment'
import MarkDenounced from '../Modals/MarkDenounced'
import MarkSolved from '../Modals/MarkSolved'
import { addComment, deleteComment, loadReportComments, updateComment } from './actions'
import styles from './styles'

class Report extends React.PureComponent {
  static navigationOptions = { header: null }

  constructor (props) {
    super(props)

    this.state = {
      comment: '',
      report: null,
      mapModalIsVisible: false,
      markSolvedIsVisible: false,
      markDenouncedIsVisible: false,
      editCommentIsVisible: false,
      editComment: {},
      refreshing: false
    }

    this.dataSource = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 })
  }

  componentDidMount () {
    InteractionManager.runAfterInteractions(() => {
      this.loadComments()
    })
  }

  loadComments = async () => {
    this.setState({ refreshing: true })
    await this.props.loadReportComments(this.props.report)
    this.setState({ refreshing: false })
  }

  parseGeoLocation = (geolocation) => ({ latitude: geolocation._lat, longitude: geolocation._long })
  getUserAvatar = (author) => author && author.photoURL ? { uri: author.photoURL } : Images.blankAvatar
  openMarkSolved = () => this.setState({ markSolvedIsVisible: true })
  closeMarkSolved = () => this.setState({ markSolvedIsVisible: false })
  openMarkDenounced = () => this.setState({ markDenouncedIsVisible: true })
  closeMarkDenounced = () => this.setState({ markDenouncedIsVisible: false })
  supportReport = (reportId) => this.props.reportActionTypeChange(reportId, 'support', this.props.user)
  openEditReport = (report) => this.props.navigation.navigate('ReportForm', { report })
  openEditComment = (editComment) => this.setState({ editComment, editCommentIsVisible: true })
  closeEditComment = () => this.setState({ editComment: {}, editCommentIsVisible: false })

  deleteReport = (report) => {
    Alert.alert(
      Utils.limitText(report.description, 30),
      'Deseja excluir este Relato permanentemente?',
      [
        { text: 'Confirmar', onPress: () => this.props.deleteReport(report.id, this.props.user.uid) },
        { text: 'Cancelar', onPress: () => console.log('Cancel Pressed'), style: 'cancel' }
      ],
      { cancelable: true }
    )
  }

  renderHeader = (report) => (
    <View style={styles.headerView}>
      <Header style={styles.header}>
        <Left>
          <Button transparent onPress={() => this.props.navigation.goBack()}>
            <Icon name='arrow-back'/>
          </Button>
        </Left>
        <Body>
          <Title>{report.subcategory.name}</Title>
        </Body>
      </Header>
      <Swiper height={200} horizontal showsButtons={report.pictures.length > 1}>
        {report.pictures.map((picture, index) => (
          <Lightbox
            key={index}
            renderContent={() => (<Image source={{ uri: picture }} style={{ flex: 1, resizeMode: 'contain' }}/>)}
          >
            <Image source={{ uri: picture }} style={styles.img}/>
          </Lightbox>
        ))}
      </Swiper>
    </View>
  )

  renderCard = (report) => {
    return (
      <Card transparent>
        <CardItem header>
          <Thumbnail source={this.getUserAvatar(report.author)}/>
          <Body style={{ marginLeft: 10 }}>
            <View>
              <Text>{report.category.name} > {report.subcategory.name}</Text>
              <Text note>{report.description}</Text>
            </View>
          </Body>
        </CardItem>
        <CardItem bordered>
          <Button icon transparent title="Localização" onPress={() => { this.setState({ mapModalIsVisible: true })}}>
            <Icon name="pin" style={{ color: '#007aff' }}/>
          </Button>
          <Text>{Utils.buildAddressString(report.address)}</Text>
        </CardItem>
        <CardItem bordered>
          {this.renderActionButton(report, 'support')}
          {this.renderActionButton(report, 'share')}
          {this.renderMenu(report)}
        </CardItem>
      </Card>
    )
  }

  renderActionButton = (report, type) => {
    const { user, shareReport } = this.props
    const userStatistics = user.profile && user.profile.statistics ? user.profile.statistics : {}
    const done = Array.isArray(userStatistics[type]) ? userStatistics[type].indexOf(report.id) !== -1 : false
    const buttons = {
      support: { iconDone: 'heart', iconNotDone: 'heart-outline', onPress: () => this.supportReport(report.id) },
      comment: { iconDone: 'comment', iconNotDone: 'comment-outline', onPress: () => this.openReport(report) },
      share: { iconDone: 'share', iconNotDone: 'share-outline', onPress: () => shareReport(report, user) }
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

  renderMenu = (report) => {
    const { uid } = this.props.user

    return (
      <Menu>
        <MenuTrigger>
          <Icon name="more" style={{ margin: 5, padding: 5, color: '#5067FF' }}/>
        </MenuTrigger>
        <MenuOptions>
          <MenuOption onSelect={this.openMarkSolved} text="Marcar como Resolvido"/>
          <MenuOption onSelect={this.openMarkDenounced} text={'Denunciar'}/>
          {report.userId === uid && (<MenuOption onSelect={() => this.openEditReport(report)} text={'Editar'}/>)}
          {report.userId === uid && (<MenuOption onSelect={() => this.deleteReport(report)} text={'Deletar'}/>)}
        </MenuOptions>
      </Menu>
    )
  }

  renderNoCommentsMessage = () => (
    <ListItem style={styles.listItem}>
      <Body style={{ flex: 1, justifyContent: 'center' }}>
        <Text>Seja o primeiro a comentar e ganhe mais pontos.</Text>
      </Body>
    </ListItem>
  )

  renderCommentRow = (comment, index) => (
    <ListItem key={index} style={styles.listItem} avatar noBorder>
      <Left style={styles.listItemLeft}>
        <Thumbnail source={this.getUserAvatar(comment.author)} large={comment.author.prefecture}/>
        {comment.author.prefecture && (
          <Badge success style={{ position: 'absolute', right: 0, bottom: 0, opacity: .9 }}>
            <Text>LV. 2</Text>
          </Badge>
        )}
      </Left>
      <Body>
        <Text>{comment.author ? comment.author.displayName : 'Não informado'}</Text>
        <Text note>{comment.text}</Text>
      </Body>
      <Right>
        <Timeago seconds={comment.createdAt.seconds}/>
      </Right>
    </ListItem>
  )

  renderLoadMoreButton = () => (
    <ListItem noBorder>
      <Body>
        <TouchableOpacity style={styles.button} onPress={this.loadComments}>
          <Text>Carregar mais comentários</Text>
        </TouchableOpacity>
      </Body>
    </ListItem>
  )

  renderAddCommentForm () {
    const { report, user, addComment } = this.props
    const { comment } = this.state

    return (
      <ListItem style={styles.addCommentView} avatar noBorder>
        <Left>
          <Thumbnail source={this.getUserAvatar(user)}/>
        </Left>
        <Body>
          <View>
            <TextInput
              multiline={true}
              onChangeText={(comment) => this.setState({ comment })}
              value={this.state.comment}
              placeholder={'Deseja comentar sobre este problema?'}
            />
          </View>
        </Body>
        <Right>
          <Button onPress={() => addComment(report, comment, user)} disabled={!comment} title="Comentar">
            <Icon name='send'/>
          </Button>
        </Right>
      </ListItem>
    )
  }

  renderCommentEditButton = (comment, user) => (
    <Button full onPress={() => this.openEditComment(comment)} disabled={comment.author.uid !== user.uid}>
      <Icon active name="create"/>
    </Button>
  )

  deleteAlert = (comment, user) => {
    Alert.alert(
      Utils.limitText(comment.text, 30),
      'Deseja excluir este Comentário permanentemente?',
      [
        { text: 'Confirmar', onPress: () => this.props.deleteComment(this.props.report.id, comment.id, user) },
        { text: 'Cancelar', onPress: () => console.log('Cancel Pressed'), style: 'cancel' }
      ],
      { cancelable: true }
    )
  }

  renderDeleteCommentButton = (comment, user) => {
    const isNotTheAuthor = !comment.author || comment.author.uid !== user.uid

    return (
      <Button full danger disabled={isNotTheAuthor} onPress={() => { this.deleteAlert(comment, user)}}>
        <Icon active name="trash"/>
      </Button>
    )
  }

  renderMapModal () {
    const { report } = this.props
    const { mapModalIsVisible } = this.state

    return (
      <Modal visible={mapModalIsVisible} onRequestClose={() => this.setState({ mapModalIsVisible: false })}>
        <MapView
          ref={'map'}
          style={styles.flex}
          initialRegion={{
            ...this.parseGeoLocation(report.geolocation),
            latitudeDelta: 1,
            longitudeDelta: 1
          }}
          minZoomLevel={15}
        >
          <MapView.Marker
            coordinate={this.parseGeoLocation(report.geolocation)}
            title={Utils.buildAddressString(report.address)}
          />
        </MapView>
      </Modal>
    )
  }

  render () {
    const { report, user, updateComment } = this.props
    const { markSolvedIsVisible, markDenouncedIsVisible, editCommentIsVisible, editComment } = this.state
    const { uid } = user

    if (!report || !report.pictures) return (<Loading isLoading/>)

    return (
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding" enabled>
        <Container>
          <HeaderImageScrollView maxHeight={300} minHeight={76} renderForeground={() => this.renderHeader(report)}>
            <Content>
              {this.renderCard(report)}

              <View style={styles.commentTitle}>
                <Text>Comentários:</Text>
              </View>

              <List style={styles.list}>
                {!report.comments || report.comments.length === 0 && this.renderNoCommentsMessage()}
              </List>

              {Array.isArray(report.comments) && (
                <List
                  leftOpenValue={75}
                  rightOpenValue={-75}
                  style={styles.list}
                  dataSource={this.dataSource.cloneWithRows(report.comments)}
                  renderRow={comment => this.renderCommentRow(comment)}
                  renderLeftHiddenRow={(comment) => this.renderCommentEditButton(comment, user)}
                  renderRightHiddenRow={(comment) => this.renderDeleteCommentButton(comment, user)}
                  refreshControl={<RefreshControl refreshing={this.state.refreshing}/>}
                />
              )}

              <List style={styles.list}>
                {this.renderLoadMoreButton()}
                {this.renderAddCommentForm()}
              </List>

              {this.renderMapModal()}

              <MarkSolved
                visible={markSolvedIsVisible}
                user={user}
                report={report}
                save={saveMarkOnReport}
                close={this.closeMarkSolved}
              />
              <MarkDenounced
                visible={markDenouncedIsVisible}
                user={user}
                report={report}
                save={saveMarkOnReport}
                close={this.closeMarkDenounced}
              />
              <EditComment
                visible={editCommentIsVisible}
                comment={editComment}
                close={this.closeEditComment}
                save={(comment) => updateComment(comment, report, user)}
              />

              <Loading isLoading={this.props.isLoading}/>
            </Content>
          </HeaderImageScrollView>
        </Container>
      </KeyboardAvoidingView>
    )
  }
}

const mapStateToProps = (state, props) => ({
  user: state.user,
  report: state.reports.list.find(item => item.id === props.navigation.state.params.reportId),
  isLoading: state.messages.loading
})
const mapDispatchToProps = {
  loadReportComments, addComment, deleteComment, shareReport, reportActionTypeChange, deleteReport,
  saveMarkOnReport, updateComment
}

export default connect(mapStateToProps, mapDispatchToProps)(Report)
