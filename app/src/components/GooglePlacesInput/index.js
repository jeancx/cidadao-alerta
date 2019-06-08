import PropTypes from 'prop-types'
import React from 'react'
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete'
import styles from './styles'

const SERVER_API_KEY = 'SERVER_API_KEY'

export class GooglePlacesInput extends React.PureComponent {
  setLocation = (data, details) => {
    const location = {
      latitude: details.geometry.location.lat,
      longitude: details.geometry.location.lng
    }

    this.props.notifyChange(location)
  }

  render () {
    return (
      <GooglePlacesAutocomplete
        placeholder='Buscar por endereço'
        minLength={3}
        autoFocus={false}
        returnKeyType={'search'}
        listViewDisplayed='false'
        fetchDetails={true}
        onPress={this.setLocation}
        query={{ key: SERVER_API_KEY, language: 'pt-BR', types: 'address' }}
        nearbyPlacesAPI='GooglePlacesSearch'
        debounce={200}
        styles={styles}
      />
    )
  }

  static propTypes = {
    notifyChange: PropTypes.func.isRequired
  }
}
