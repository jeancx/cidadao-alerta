import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import withStyles from '@material-ui/core/styles/withStyles'
import React from 'react'
import { Title } from 'react-admin'
import styles from './styles'

const Profile = () => (
  <Card>
    <Title title={'Perfil'}/>
    <CardContent/>
  </Card>
)

export default withStyles(styles)(Profile)