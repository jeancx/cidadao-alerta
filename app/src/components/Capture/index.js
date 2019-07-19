import { Camera, ImageManipulator, ImagePicker, Permissions } from 'expo'
import { Fab, Icon } from 'native-base'
import PropTypes from 'prop-types'
import React from 'react'
import { View } from 'react-native'
import styles from './styles'

const IMAGE_OPTIONS = { base64: false, exif: true, aspect: [4, 3], quality: 1, skipProcessing: true }

class Capture extends React.PureComponent {
  state = { type: Camera.Constants.Type.back, isLoading: true }

  async componentDidMount () {
    const { status } = await Permissions.askAsync(Permissions.CAMERA)
    this.setState({ hasCameraPermission: status === 'granted', isLoading: false })
  }

  changeCameraType = () => {
    const { Type } = Camera.Constants
    this.setState(state => ({ type: state.type === Type.back ? Type.front : Type.back }))
  }

  imagePicker = async () => {
    this.setState({ isLoading: true })
    const result = await ImagePicker.launchImageLibraryAsync({ ...IMAGE_OPTIONS, autoFocus: true })

    if (!result.cancelled) {
      const resizedPhoto = await this.resizePicture(result)

      this.props.save(resizedPhoto.uri)
    } else {
      this.setState({ isLoading: false })
    }
  }

  takePicture = async () => {
    this.setState({ isLoading: false })
    const picture = await this.refs.camera.takePictureAsync(IMAGE_OPTIONS)
    this.refs.camera.pausePreview()

    const resizedPhoto = await this.resizePicture(picture)

    this.props.save(resizedPhoto.uri)
  }

  resizePicture = (picture) => {
    return ImageManipulator.manipulateAsync(
      picture.uri,
      [{ resize: { width: 768 } }],
      { compress: 0.8, format: 'jpeg', base64: false }
    )
  }

  render () {
    return (
      <View style={{ flex: 1 }}>
        <Camera style={{ flex: 1 }} type={this.state.type} ref={'camera'}>
          <View style={styles.cameraView}>
            <Fab position="topRight" style={styles.smallFab} onPress={this.props.close}
                 active={!this.state.isLoading}>
              <Icon name="close"/>
            </Fab>
            <Fab position="bottomLeft" style={styles.smallFab} onPress={this.imagePicker}
                 active={!this.state.isLoading}>
              <Icon name="images"/>
            </Fab>
            <Fab position="bottomLeft" containerStyle={styles.fabOnMiddle} style={styles.normalFab}
                 onPress={this.takePicture} active={!this.state.isLoading}>
              <Icon name="camera"/>
            </Fab>
            <Fab position="bottomRight" style={styles.smallFab} onPress={this.changeCameraType}
                 active={!this.state.isLoading}>
              <Icon name="refresh"/>
            </Fab>
          </View>
        </Camera>
      </View>
    )
  }
}

Capture.propTypes = {
  save: PropTypes.func.isRequired,
  close: PropTypes.func.isRequired
}

export default Capture
