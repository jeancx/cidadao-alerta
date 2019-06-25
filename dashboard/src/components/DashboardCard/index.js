import Card from '@material-ui/core/Card'
import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import PropTypes from 'prop-types'
import React from 'react'
import CardIcon from '../CardIcon'
import styles from './styles'

class DashboardCard extends React.PureComponent {
  render () {
    const { classes, icon, bgColor, title, value } = this.props

    return (
      <div className={classes.main}>
        <CardIcon icon={icon} bgColor={bgColor}/>
        <Card className={classes.card}>
          <Typography className={classes.title} color="textSecondary">{title}</Typography>
          <Typography variant="headline" component="h2">{value}</Typography>
        </Card>
      </div>
    )
  }
}

DashboardCard.propTypes = {
  icon: PropTypes.string.isRequired,
  bgColor: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
}

export default withStyles(styles)(DashboardCard)