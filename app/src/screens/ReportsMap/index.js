import { Location, MapView, Permissions } from 'expo'
import { Body, Button, Container, Fab, Icon, Left, ListItem, Right, Text, Thumbnail } from 'native-base'
import PropTypes from 'prop-types'
import React from 'react'
import { InteractionManager, Modal, View } from 'react-native'
import { connect } from 'react-redux'
import { fetchNearReports, openReport } from 'screens/Timeline/actions'
import Supercluster from 'supercluster'
import styles from './styles'

const DELTAS = { latitudeDelta: 1, longitudeDelta: 1 }

class ReportsMap extends React.PureComponent {
  state = { markers: [], region: this.props.region, initialRender: true, isVisible: false, marker: null }

  componentDidMount = async () => {
    InteractionManager.runAfterInteractions(() => {
      this.props.fetchNearReports()
      this.generateMarkers()
      this.getLocationAsync()
    })
  }

  componentDidUpdate = (prevProps) => {
    if (prevProps.reports.length !== this.props.reports.length) {
      this.generateMarkers()
    }
  }

  openReport = (reportId) => {
    this.closeModal()
    this.props.navigation.navigate('Report', { reportId })
  }

  openModal = (marker) => this.setState({ isVisible: true, marker })
  closeModal = () => this.setState({ isVisible: false, marker: null })

  getLocationAsync = async () => {
    let { status } = await Permissions.askAsync(Permissions.LOCATION)
    if (status !== 'granted') {
      this.setState({
        errorMessage: 'Permission to access location was denied'
      })
    }

    let location = await Location.getCurrentPositionAsync({})
    const region = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      ...DELTAS
    }
    await this.setState({ region })
  }

  generateMarkers = async () => {
    const markers = await Promise.all([...this.props.reports].map(report => {
      return {
        geometry: { coordinates: [report.geolocation._long, report.geolocation._lat] },
        id: report.id,
        author: report.author,
        title: report.subcategory.name,
        description: report.description,
        image: report.pictures[0]
      }
    }))

    this.setState({ markers }, () => this.refs.map.fitToElements(true))
  }

  clusterMarker = (count) => (
    <View style={styles.container}>
      <View style={styles.bubble}>
        <Text style={styles.count}>{count}</Text>
      </View>
    </View>
  )

  renderMarker = (marker, index) => {
    const coordinate = { longitude: marker.geometry.coordinates[0], latitude: marker.geometry.coordinates[1] }

    if (marker.properties) {
      return (
        <MapView.Marker key={index} coordinate={coordinate}>
          {this.clusterMarker(marker.properties.point_count)}
        </MapView.Marker>
      )
    }

    return (
      <MapView.Marker
        key={index}
        coordinate={coordinate}
        onPress={() => this.openModal(marker)}
      />
    )
  }

  getCluster = (places, region) => {
    let markers = []

    try {
      const cluster = new Supercluster({ radius: 40, maxZoom: 16 })
      const padding = 0
      const getZoomLevel = (longitudeDelta) => {
        const angle = longitudeDelta
        return Math.round(Math.log(360 / angle) / Math.LN2)
      }

      cluster.load(places)
      markers = cluster.getClusters(
        [
          region.longitude - region.longitudeDelta * (0.5 + padding),
          region.latitude - region.latitudeDelta * (0.5 + padding),
          region.longitude + region.longitudeDelta * (0.5 + padding),
          region.latitude + region.latitudeDelta * (0.5 + padding)
        ],
        getZoomLevel(region.longitudeDelta)
      )

      return {
        markers,
        cluster
      }
    } catch (e) {
      console.debug('failed to create cluster', e)

      return { markers }
    }
  }

  render () {
    const { region, markers, marker, isVisible } = this.state
    const cluster = this.getCluster(markers, region)

    return (
      <Container>
        <MapView
          ref="map"
          region={region}
          style={styles.map}
          provider={MapView.PROVIDER_GOOGLE}
          onRegionChangeComplete={region => this.setState({ region })}
        >
          {cluster.markers.map((marker, index) => this.renderMarker(marker, index))}
        </MapView>

        <Fab position="bottomRight" onPress={this.getLocationAsync} style={{ backgroundColor: '#5067FF' }}>
          <Icon name="locate"/>
        </Fab>

        <Modal visible={isVisible} onRequestClose={() => this.closeModal()} transparent>
          <View style={styles.modalView}>
            {marker && (
              <ListItem thumbnail>
                <Left>
                  <Thumbnail square source={{ uri: marker.image }}/>
                </Left>
                <Body>
                  <Text>{marker.title}</Text>
                  <Text note numberOfLines={2}>{marker.description}</Text>
                </Body>
                <Right>
                  <Button transparent onPress={() => this.openReport(marker.id)}>
                    <Text>Ver</Text>
                  </Button>
                </Right>
              </ListItem>
            )}
            <Button iconLeft transparent primary onPress={this.closeModal} style={styles.closeButton}>
              <Icon name="md-close"/>
            </Button>
          </View>
        </Modal>
      </Container>
    )
  }
}

ReportsMap.propTypes = {
  user: PropTypes.object.isRequired,
  reports: PropTypes.array.isRequired,
  initialRegion: PropTypes.object
}

ReportsMap.defaultProps = {
  reports: [],
  region: {
    latitude: -26.967183,
    longitude: -48.8848786,
    ...DELTAS
  }
}

const mapStateToProps = state => ({
  user: state.user,
  reports: state.reports.list
})

const mapDispatchToProps = { fetchNearReports, openReport }

export default connect(mapStateToProps, mapDispatchToProps)(ReportsMap)
