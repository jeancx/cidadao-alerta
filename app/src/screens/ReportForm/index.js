import Loading from 'components/Loading'
import Messages from 'components/Messages'
import Spacer from 'components/Spacer'
import ErrorMessages from 'constants/errors'
import {
  Button, Col, Container, Content, Footer, FooterTab, Form, Grid, Icon, Input, Item, Label, Picker, Text, Textarea
} from 'native-base'
import React from 'react'
import { ActivityIndicator, Dimensions, KeyboardAvoidingView, TouchableOpacity, View } from 'react-native'
import { Avatar } from 'react-native-elements'
import { connect } from 'react-redux'
import CaptureModal from 'screens/Modals/CaptureModal'
import ReportLocation from 'screens/Modals/ReportLocation'
import { fetchCategories } from 'screens/Timeline/actions'
import Utils from 'services/utils'
import { addPicture, changeInput, changeLocation, loadForm, removePicture, resetForm, save } from './actions'
import styles from './styles'

const AVATAR_SIZE = Dimensions.get('window').width / 3
const PItem = Picker.Item

class ReportForm extends React.PureComponent {
  state = {
    takingPicture: false,
    changingLocation: false,
    subcategories: [],
    errorMessage: null,
    newReport: !this.props.navigation.state.params,
    loadSubcategories: false
  }

  componentDidMount () {
    if (!this.props.categories || this.props.categories.length === 0) this.props.fetchCategories()

    if (this.state.newReport) {
      this.props.resetForm()
      this.setState({ takingPicture: true })
    } else {
      this.props.loadForm(this.props.navigation.state.params.report)
      this.setState({ loadSubcategories: true })
    }
  }

  componentDidUpdate (prevProps) {
    const { form, categories } = this.props

    if (this.state.loadSubcategories && form && form.category && form.category.id) {
      const category = categories.find(item => item.id === form.category.id)
      this.setState({ subcategories: category.subcategories })
    }
  }

  saveForm = () => {
    const { form, user, save } = this.props

    if (!form.category) return this.setState({ errorMessage: ErrorMessages.missingCategory })
    if (!form.subcategory) return this.setState({ errorMessage: ErrorMessages.missingSubcategory })
    if (!form.description) return this.setState({ errorMessage: ErrorMessages.missingDescription })
    if (form.pictures.length <= 0) return this.setState({ errorMessage: ErrorMessages.missingPicture })

    save(form, user).then(this.props.navigation.goBack)
  }

  onCategoryValueChange = (value) => {
    if (this.props.categories.length > 0 && value) {
      const category = this.props.categories.find(item => item.id === value)
      this.props.changeInput('category', { id: category.id, name: category.name })
      this.setState({ subcategories: category.subcategories })
    }
  }

  onSubCategoryValueChange = (value) => {
    if (this.state.subcategories.length > 0 && value) {
      const subcategory = this.state.subcategories.find(item => item.id === value)
      this.props.changeInput('subcategory', { id: subcategory.id, name: subcategory.name })
    }
  }

  savePicture = (picture) => {
    this.props.addPicture(picture)
    const showLocationAfterSavePicture = !this.props.navigation.state.params && this.props.form.pictures.length === 0
    this.setState(state => ({ takingPicture: false }), () => {
      this.setState(state => ({ changingLocation: state.newReport, newReport: false }))
    })
  }

  saveLocation = (geolocation, address) => {
    this.setState({ changingLocation: false })
    this.props.changeLocation(geolocation, address)
  }

  closeCaptureModal = () => this.setState({ takingPicture: false })
  closeLocationModal = () => this.setState({ changingLocation: false })

  renderThumbnail = (picture) => {
    return (picture)
      ? (<Avatar
        source={{ uri: picture }}
        size={AVATAR_SIZE}
        onPress={() => this.props.removePicture(picture)}
        onEditPress={() => this.props.removePicture(picture)}
        showEditButton
        editButton={{ name: 'highlight-off' }}
      />)
      : (<Avatar
        icon={{ name: 'add-a-photo', type: 'material' }}
        size={AVATAR_SIZE}
        onPress={() => {this.setState({ takingPicture: true })}}
      />)
  }

  render () {
    const { takingPicture, changingLocation, subcategories, errorMessage } = this.state
    const { categories, changeInput, form, changeLocation } = this.props

    return (
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding" enabled>
        <Container>
          {form && Array.isArray(form.pictures) && form.category && form.subcategory ? (
            <Content>
              <View style={styles.swiperView}>
                <Grid>
                  <Col>{this.renderThumbnail(form.pictures[0])}</Col>
                  <Col>{this.renderThumbnail(form.pictures[1])}</Col>
                  <Col>{this.renderThumbnail(form.pictures[2])}</Col>
                </Grid>
              </View>

              <Form>
                <TouchableOpacity onPress={() => this.setState({ changingLocation: true })}>
                  <Item disabled>
                    <Input disabled value={Utils.buildAddressString(form.address)}/>
                    <Icon name="pin" style={{ color: 'red' }}/>
                  </Item>
                </TouchableOpacity>
                <Item stackedLabel>
                  <Label>Categoria</Label>
                  <Picker
                    mode="dropdown"
                    iosIcon={<Icon name="arrow-down"/>}
                    style={styles.picker}
                    placeholder="Escolha a Categoria"
                    selectedValue={form.category.id}
                    onValueChange={this.onCategoryValueChange}
                  >
                    <PItem label="" value=""/>
                    {categories.map((category) => (
                      <PItem key={category.id} label={category.name} value={category.id}/>))}
                  </Picker>
                </Item>
                <Item stackedLabel>
                  <Label>Subcategoria</Label>
                  <Picker
                    mode="dropdown"
                    iosIcon={<Icon name="arrow-down"/>}
                    style={styles.picker}
                    placeholder="Escolha a Subcategoria"
                    selectedValue={form.subcategory.id}
                    onValueChange={this.onSubCategoryValueChange}
                    disabled={!form.category}
                  >
                    <PItem label="" value=""/>
                    {subcategories.map((item) => (<PItem key={item.id} label={item.name} value={item.id}/>))}
                  </Picker>
                </Item>
                <Item last>
                  <Textarea
                    rowSpan={5}
                    bordered={false}
                    placeholder={'Descrição: Escreve sobre o problema (Quanto mais detalhado melhor).'}
                    onChangeText={value => changeInput('description', value)}
                    value={form.description}
                    style={styles.textArea}
                  />
                </Item>
                <Spacer size={20}/>
              </Form>

              <CaptureModal save={this.savePicture} close={this.closeCaptureModal} visible={takingPicture}/>
              <ReportLocation save={this.saveLocation} close={this.closeLocationModal} changeLocation={changeLocation}
                              visible={changingLocation}/>

              {errorMessage && <Messages message={errorMessage}/>}

              <Loading isLoading={this.props.isLoading}/>
            </Content>
          ) : (<ActivityIndicator/>)}

          <Footer>
            <FooterTab>
              <Button block onPress={this.saveForm}>
                <Text>Salvar</Text>
              </Button>
            </FooterTab>
          </Footer>
        </Container>
      </KeyboardAvoidingView>
    )
  }
}

const mapStateToProps = state => ({
  user: state.user,
  form: state.reports.form,
  categories: state.categories.list,
  isLoading: state.messages.loading
})
const mapDispatchToProps = {
  fetchCategories, changeInput, addPicture, removePicture, changeLocation, loadForm, resetForm, save
}

export default connect(mapStateToProps, mapDispatchToProps)(ReportForm)
