import { Place as PlaceIcon } from '@material-ui/icons'
import PropTypes from 'prop-types'
import React from 'react'

import styled from 'styled-components'

const Wrapper = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 18px;
  height: 18px;
  user-select: none;
  transform: translate(-50%, -50%);
  cursor: ${props => (props.onClick ? 'pointer' : 'default')};
  &:hover {
    z-index: 1;
  }
`

const Marker = props => (
  <Wrapper alt={props.text} {...props.onClick ? { onClick: props.onClick } : {}}>
    <PlaceIcon style={{ color: props.solved ? '#37c73c' : '#E57373', stroke: 'black' }}/>
  </Wrapper>
)

Marker.defaultProps = {
  onClick: null
}

Marker.propTypes = {
  onClick: PropTypes.func,
  text: PropTypes.string.isRequired
}

export default Marker