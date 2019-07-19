import Loading from 'components/Loading'
import Spacer from 'components/Spacer'
import Images from 'constants/images'
import {
  Body, Button, Container, Content, Fab, Form, Icon, Input, Item, Label, Left, ListItem, Right, Text
} from 'native-base'
import React from 'react'
import { Alert, Linking, View } from 'react-native'
import AnimatedBar from 'react-native-animated-bar'
import { Avatar, ButtonGroup } from 'react-native-elements'
import HeaderImageScrollView from 'react-native-image-header-scroll-view'
import { connect } from 'react-redux'
import CaptureModal from 'screens/Modals/CaptureModal'
import pointsByLevel from 'services/gamefication/pointsByLevel.json'
import trophies from 'services/gamefication/trophies'
import { changeInput, fillProfileForm, logout, save } from './actions'
import styles from './styles'

class Profile extends React.PureComponent {
  state = { selectedIndex: 0, takingPicture: false }

  savePicture = (picture) => {
    this.props.changeInput('photoURL', picture)
    this.setState({ takingPicture: false })
  }

  onSelectedIndexChange = (selectedIndex) => {
    selectedIndex === 2 ? this.logoutAlert() : this.setState({ selectedIndex })

    if (selectedIndex === 1) this.props.fillProfileForm()
  }

  renderMenu = () => (
    <ButtonGroup
      onPress={(selectedIndex) => { this.onSelectedIndexChange(selectedIndex) }}
      selectedIndex={this.state.selectedIndex}
      buttons={[
        (<Icon name="trophy"/>),
        (<Icon name="create"/>),
        (<Icon name="exit"/>)
      ]}
      underlayColor={'transparent'}
      containerStyle={styles.buttonGroup}/>
  )

  getAvatar = (form) => {
    return form.photoURL ? { uri: form.photoURL } : Images.blankAvatar
  }

  getProfileStatistics = () => {
    if (this.props.user && this.props.user.profile && this.props.user.profile.statistics) {
      return this.props.user.profile.statistics
    } else {
      return { experience: 0, level: 1 }
    }
  }

  renderProfileHeader = (form) => {
    const level = this.getProfileStatistics().level || 1

    return (
      <View style={styles.headerContainer}>
        <View style={styles.userRow}>
          <Avatar source={this.getAvatar(form)} size={120} showEditButton={this.state.selectedIndex === 1}
                  onEditPress={() => this.setState({ takingPicture: true })} rounded/>
          <View style={styles.userNameRow}>
            <Text style={styles.userNameText} uppercase>{form.displayName}</Text>
          </View>
          <View style={styles.userAddressRow}>
            <View>
              <Icon name={'trophy'} style={styles.icon}/>
            </View>
            <View>
              <Text style={styles.userLevelText}>Level {level}</Text>
            </View>
          </View>
        </View>

        <Fab position="topRight" onPress={this.openGoogleForm} style={{ backgroundColor: '#5067FF' }}>
          <Icon name="help"/>
        </Fab>
      </View>
    )
  }

  renderXpBar = () => {
    const experience = this.getProfileStatistics().experience || 0
    const level = this.getProfileStatistics().level || 1
    const nextLevelPoints = pointsByLevel[level > 1 ? level - 1 : 1].points
    const previousLevelPoints = pointsByLevel[level > 1 ? level - 2 : 0].points
    const points = nextLevelPoints - previousLevelPoints
    const exp = experience - previousLevelPoints
    const progress = 1 / points * exp

    return (
      <AnimatedBar
        progress={progress}
        height={null}
        borderColor="#DDD"
        barColor="#3F51B5"
        borderRadius={5}
        borderWidth={5}
        duration={500}
      >
        <View style={[styles.row, styles.center]}>
          <Text style={[styles.barText, { fontSize: 30 }]}>
            {exp} pontos de {nextLevelPoints}
          </Text>
        </View>
      </AnimatedBar>
    )
  }

  renderTrophies = () => {
    const { statistics } = this.props.user.profile

    return (
      <View>
        {this.renderXpBar()}
        {trophies.map((trophie, index) => (
          <ListItem key={index} icon>
            <Left>
              {statistics && statistics.trophy && statistics.trophy.some(item => item.name === trophie.name) ? (
                <Icon name="trophy" style={{ color: 'gold' }}/>
              ) : (
                <Icon name="trophy"/>
              )}
            </Left>
            <Body>
              <Text>{trophie.name}</Text>
            </Body>
            <Right>
              <Text>+{trophie.points} XP</Text>
            </Right>
          </ListItem>
        ))}
      </View>
    )
  }

  logoutAlert = () => {
    Alert.alert(
      'Sair',
      'Deseja desconectar sua conta neste dispositivo?',
      [
        { text: 'Cancelar', onPress: () => console.log('cancelado'), style: 'cancel' },
        { text: 'Confirmar', onPress: () => this.props.logout() }
      ],
      { cancelable: true }
    )
  }

  renderEditProfile = (form) => {
    const { changeInput, save } = this.props

    return (
      <View>
        <Form>
          <Item stackedLabel>
            <Label>Nome</Label>
            <Input value={form.displayName} onChangeText={value => changeInput('displayName', value)}/>
          </Item>
          <Item stackedLabel>
            <Label>E-mail</Label>
            <Input
              value={form.email}
              onChangeText={value => changeInput('email', value)}
              autoCapitalize="none"
              keyboardType="email-address"
              disabled
            />
          </Item>
          <Item stackedLabel last>
            <Label>Senha</Label>
            <Input value={form.password} secureTextEntry onChangeText={value => changeInput('password', value)}/>
          </Item>
          <Item stackedLabel last>
            <Label>Confirmação de Senha</Label>
            <Input value={form.passwordConf} secureTextEntry
                   onChangeText={value => changeInput('passwordConf', value)}/>
          </Item>
          <Item stackedLabel last>
            <Label>Telefone</Label>
            <Input value={form.phoneNumber} onChangeText={value => changeInput('phoneNumber', value)}/>
          </Item>
          <Spacer size={20}/>
          <Button block onPress={() => save(form)}>
            <Text>Salvar</Text>
          </Button>
          <Spacer size={20}/>
        </Form>
      </View>
    )
  }

  renderCaptureModal = () => {
    return (
      <CaptureModal
        visible={this.state.takingPicture}
        save={this.savePicture}
        close={() => this.setState({ takingPicture: false })}
      />
    )
  }

  openGoogleForm = () => {
    const url = 'https://forms.gle/TwG5nUKWbkks3tSi9'
    Linking.canOpenURL(url).then(supported => {
      if (supported) Linking.openURL(url)
    })
  }

  render () {
    const form = this.props.user.profileForm
    const hours = new Date().getHours()
    const isDayTime = hours > 6 && hours < 20
    const headerImage = isDayTime ?
      require('assets/images/profile_day.png') :
      require('assets/images/profile_night.png')

    return (
      <Container>
        <HeaderImageScrollView
          maxHeight={200}
          minHeight={0}
          overlayColor={'white'}
          minOverlayOpacity={0.6}
          maxOverlayOpacity={0.1}
          headerImage={headerImage}
          renderForeground={() => (<View>{this.renderProfileHeader(form)}</View>)}
        >
          <Content>
            {this.renderMenu()}
            {this.state.selectedIndex === 0 && this.renderTrophies(form)}
            {this.state.selectedIndex === 1 && this.renderEditProfile(form)}
            {this.renderCaptureModal()}
            <Loading isLoading={this.props.isLoading}/>
          </Content>
        </HeaderImageScrollView>
      </Container>
    )
  }
}

const mapStateToProps = state => ({
  user: state.user,
  profileForm: state.user.profileForm,
  isLoading: state.messages.loading
})

const mapDispatchToProps = { fillProfileForm, changeInput, save, logout }

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Profile)
