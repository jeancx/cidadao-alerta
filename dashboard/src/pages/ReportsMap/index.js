import { Button, Card, CardActions, CardContent, withStyles } from '@material-ui/core'
import { Check, Close, LocationOn, Whatshot } from '@material-ui/icons'
import GoogleMapReact from 'google-map-react'
import React from 'react'
import { GET_LIST, withDataProvider } from 'react-admin'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import Marker from './marker'
import styles from './styles'

const API_KEY = ''

class ReportsMap extends React.PureComponent {
  state = {
    reports: [],
    markers: [],
    heatmapPoints: [],
    heatmapVisible: false,
    markersVisible: false,
    solvedVisible: false,
    openVisible: true
  }

  componentDidMount () {
    this.fetchReports()
  }

  componentDidUpdate (_, prevState) {
    if (
      prevState.heatmapVisible !== this.state.heatmapVisible
      || prevState.solvedVisible !== this.state.solvedVisible
      || prevState.openVisible !== this.state.openVisible
    ) {
      this.setState(state => {
        const heatmapPoints = []
        const markers = []
        state.reports.forEach((report) => {
            const solved = !!report.solvedAt
            let showMarker = false
            if (state.solvedVisible && solved) showMarker = true
            if (state.openVisible && !solved) showMarker = true
            if (showMarker) {
              const latLng = { lat: report.location.geopoint._lat, lng: report.location.geopoint._long }
              heatmapPoints.push({ ...latLng })
              markers.push({ ...latLng, text: report.description, solved })
            }
          }
        )
        return { heatmapPoints, markers }
      })
      if (this._googleMap !== undefined) {
        this._googleMap.heatmap.setMap(this.state.heatmapVisible ? this._googleMap.map_ : null)
      }
    }

  }

  fetchReports () {
    this.props.dataProvider(
      GET_LIST,
      'reports',
      { filter: {}, sort: { field: 'createdAt', order: 'DESC' } })
      .then(({ data: reports }) => this.setState({ reports, heatmapVisible: true }))
  }

  toggleHeatMap () {
    this.setState({ heatmapVisible: !this.state.heatmapVisible })
  }

  toggleMarkers (type) {
    this.setState(state => {
      if (type && type === 'solved') return { solvedVisible: !state.solvedVisible }
      if (type && type === 'open') return { openVisible: !state.openVisible }
      return { markersVisible: !state.markersVisible }
    })
  }

  render () {
    const { classes, center, zoom } = this.props
    const { heatmapPoints, markers, heatmapVisible, markersVisible, openVisible, solvedVisible } = this.state
    const heatMapData = { positions: heatmapPoints, options: { radius: 20, opacity: 0.6 } }
    const activeColor = (active) => ({ color: active ? '#000000' : '#878787' })
    return (
      <Card className={classes.card}>
        <CardActions className={classes.actions}>
          <Button className="toggleButton" onClick={this.toggleHeatMap.bind(this)} style={activeColor(heatmapVisible)}>
            <Whatshot style={{ marginRight: 5 }}/> MAPA DE CALOR
          </Button>
          <Button className="toggleButton" onClick={this.toggleMarkers.bind(this)} style={activeColor(markersVisible)}>
            <LocationOn style={{ marginRight: 5 }}/> MARCADORES
          </Button>
          <Button className="toggleButton" onClick={this.toggleMarkers.bind(this, 'solved')}
                  style={activeColor(solvedVisible)}>
            <Check style={{ marginRight: 5 }}/> RESOLVIDOS
          </Button>
          <Button className="toggleButton" onClick={this.toggleMarkers.bind(this, 'open')}
                  style={activeColor(openVisible)}>
            <Close style={{ marginRight: 5 }}/> ABERTOS
          </Button>
        </CardActions>
        <CardContent className={classes.cardContent}>
          <GoogleMapReact
            ref={(el) => this._googleMap = el}
            bootstrapURLKeys={{ key: API_KEY }}
            defaultCenter={center}
            defaultZoom={zoom}
            heatmapLibrary={true}
            heatmap={heatMapData}
            yesIWantToUseGoogleMapApiInternals
          >
            {markersVisible && markers.map((mark) => (<Marker {...mark}/>))}
          </GoogleMapReact>
        </CardContent>
      </Card>

    )
  }
}

ReportsMap.defaultProps = {
  center: {
    lat: -27.2824166,
    lng: -48.8498116
  },
  zoom: 12
}

const mapStateToProps = state => ({})
export default compose(connect(mapStateToProps), withDataProvider)(withStyles(styles)(ReportsMap))
