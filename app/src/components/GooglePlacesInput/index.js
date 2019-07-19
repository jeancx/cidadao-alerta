import { Constants } from 'expo'
import PropTypes from 'prop-types'
import React from 'react'
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete'
import styles from './styles'

class GooglePlacesInput extends React.PureComponent {
  setLocation = (data, details) => {
    const location = {
      latitude: details.geometry.location.lat,
      longitude: details.geometry.location.lng
    }
    const { notifyChange } = this.props

    notifyChange(location)
  }

  render () {
    return (
      <GooglePlacesAutocomplete
        placeholder="Buscar por endereço"
        minLength={3}
        autoFocus={false}
        returnKeyType="search"
        listViewDisplayed="false"
        fetchDetails
        onPress={this.setLocation}
        query={{ key: Constants.manifest.extra.serverApiKey, language: 'pt-BR', types: 'address' }}
        nearbyPlacesAPI="GooglePlacesSearch"
        debounce={200}
        styles={styles}
      />
    )
  }
}

GooglePlacesInput.propTypes = {
  notifyChange: PropTypes.func.isRequired
}

export default GooglePlacesInput
