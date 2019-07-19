import GooglePlacesInput from 'components/GooglePlacesInput'
import { Location, MapView, Permissions } from 'expo'
import { Button, Container, Fab, Footer, FooterTab, Icon, Text } from 'native-base'
import PropTypes from 'prop-types'
import React from 'react'
import { Modal, ToastAndroid, View } from 'react-native'
import Utils from 'services/utils'
import styles from './styles'

const DEFAULT_LOCATION = { latitude: -27.2773338, longitude: -48.8514188 }
const DELTA = { latitudeDelta: 0.0043, longitudeDelta: 0.0034 }

class ReportLocation extends React.PureComponent {
  constructor (props) {
    super(props)

    this.state = { geolocation: { ...DEFAULT_LOCATION }, address: '', fullAddress: {} }
    this.marker = null
    this.map = null
  }

  getLocationAsync = async () => {
    const { status } = await Permissions.askAsync(Permissions.LOCATION)
    if (status !== 'granted') {
      const message = 'Permissão para acessar a Localização, necessária!'
      ToastAndroid.showWithGravity(message, ToastAndroid.LONG, ToastAndroid.CENTER)
    } else {
      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High })
      await this.updateLocation(location.coords)
      if (this.marker) {
        this.marker.showCallout()
        this.map.animateToRegion({
          latitude: parseFloat(location.coords.latitude),
          longitude: parseFloat(location.coords.longitude),
          latitudeDelta: 0.0043,
          longitudeDelta: 0.0034
        })
      }
    }
  }

  updateLocation = async (geolocation) => {
    const { changeLocation } = this.props

    this.setState({ geolocation })
    const address = await Location.reverseGeocodeAsync(geolocation)
    this.setState({ address: Utils.buildAddressString(address[0]), fullAddress: address[0] })
    changeLocation(geolocation, address[0])
    this.marker.showCallout()
  }

  changeMarker = (geolocation) => {
    this.updateLocation(geolocation.coordinate)
  }

  onEventChange = (event) => {
    event.persist()
    this.changeMarker(event.nativeEvent)
  }

  render () {
    const { visible, save, close } = this.props
    const { geolocation, address, fullAddress } = this.state

    return (
      <Modal
        animationType="slide"
        style={styles.modal}
        transparent={false}
        visible={visible}
        onRequestClose={close}
        onShow={this.getLocationAsync}
      >
        <Container>
          <View style={styles.autocompleteContainer}>
            <GooglePlacesInput notifyChange={this.updateLocation}/>
          </View>
          <MapView
            ref={(ref) => {this.map = ref}}
            region={{ ...DELTA, ...geolocation }}
            style={styles.map}
            onPress={this.onEventChange}
            showsUserLocation
            provider={MapView.PROVIDER_GOOGLE}
            minZoomLevel={8}
            maxZoomLevel={18}
          >
            <MapView.Marker ref={ref => {this.marker = ref}} title={address} coordinate={geolocation} draggable
                            onDragEnd={this.onEventChange}/>
          </MapView>

          <Fab position="bottomRight" onPress={this.getLocationAsync} style={styles.locateButton}>
            <Icon name="locate"/>
          </Fab>

          <Footer>
            <FooterTab>
              <Button block onPress={() => save(geolocation, fullAddress)} title="Confirmar Localização">
                <Text>Confirmar Localização</Text>
              </Button>
            </FooterTab>
          </Footer>
        </Container>
      </Modal>
    )
  }
}

ReportLocation.propTypes = {
  visible: PropTypes.bool.isRequired,
  save: PropTypes.func.isRequired,
  close: PropTypes.func.isRequired,
  changeLocation: PropTypes.func.isRequired
}

export default ReportLocation
