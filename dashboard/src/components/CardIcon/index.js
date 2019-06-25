import { Icon, withStyles } from '@material-ui/core'
import Card from '@material-ui/core/Card'
import React from 'react'
import styles from './styles'

class CardIcon extends React.PureComponent {
  render () {
    const { classes, bgColor, icon } = this.props

    return (
      <Card className={classes.card} style={{ backgroundColor: bgColor }}>
        <Icon className={classes.icon}>{icon}</Icon>
      </Card>
    )
  }
}

export default withStyles(styles)(CardIcon)