import {
  Card, CardContent, CardHeader, Grid, GridList, GridListTile, GridListTileBar, IconButton, withStyles
} from '@material-ui/core'
import { Info as GoToIcon } from '@material-ui/icons'
import React from 'react'
import { GET_LIST, withDataProvider } from 'react-admin'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import DashboardCard from '../../components/DashboardCard'

const styles = theme => ({
  root: {
    marginLeft: 2
  },
  reportCard: {
    marginTop: 30
  },
  gridList: {
    flexWrap: 'nowrap',
    transform: 'translateZ(0)',
    overflowX: 'scroll'
  },
  title: {
    color: 'white'
  },
  titleBar: {
    height: 50,
    background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)'
  },
  icon: {
    color: 'white'
  }
})

class Dashboard extends React.PureComponent {
  state = {
    reports: [],
    statistics: { reports: 0, openReports: 0, closedReports: 0, openDenounces: 0, waitApproval: 0 }
  }

  componentDidMount () {
    this.fetchReports()
  }

  async fetchReports () {
    const { data: reports } = await this.props.dataProvider(
      GET_LIST,
      'reports',
      {
        filter: { active: true },
        sort: { field: 'createdAd', order: 'DESC' },
        pagination: { page: 1, perPage: 9 }
      }
    )
    this.setState({ reports }, this.calculateStatistics)
  }

  calculateStatistics = () => {
    this.setState(({ reports, statistics }) => {
      let openReports = 0, closedReports = 0
      reports.forEach(report => {
        report.solvedAt ? closedReports++ : openReports++
        this.calculateMarks(report.id)
      })
      return { statistics: { ...statistics, reports: reports.length, openReports, closedReports } }
    })
  }

  calculateMarks = (id) => {
    const { dataProvider } = this.props

    dataProvider(
      GET_LIST,
      [{ type: 'collection', value: 'reports' }, { type: 'doc', value: id }, { type: 'collection', value: 'marks' }],
      {
        filter: {},
        sort: { field: 'createdAt', order: 'DESC' }
      })
      .then(({ data: marks }) => {
        this.setState(({ statistics }) => {
          let openDenounces = statistics.openDenounces, waitApproval = statistics.waitApproval
          waitApproval += marks.filter(mark => mark.type === 'solved' && !mark.acceptedAt).length
          openDenounces += marks.filter(mark => mark.type === 'denounced' && !mark.acceptedAt).length
          return { statistics: { ...statistics, openDenounces, waitApproval } }
        })
      })
  }

  render () {
    const { permissions, classes } = this.props
    const { reports, statistics } = this.state

    return (
      <div className={classes.root}>
        <Grid container spacing={24}>
          {permissions && (permissions.superadmin || permissions.admin || permissions.prefecture) && (
            <Grid item sm={12} md={4} lg>
              <DashboardCard icon={'report'} bgColor={'#EF6C00'} title={'Relatos'} value={statistics.reports}/>
            </Grid>
          )}
          {permissions && (permissions.superadmin || permissions.admin || permissions.prefecture) && (
            <Grid item sm={12} md={4} lg>
              <DashboardCard icon={'report'} bgColor={'#018786'} title={'Relatos Resolvidos'}
                             value={statistics.closedReports}/>
            </Grid>
          )}
          {permissions && (permissions.superadmin || permissions.admin || permissions.prefecture) && (
            <Grid item sm={12} md={4} lg>
              <DashboardCard icon={'report'} bgColor={'#B00020'} title={'Relatos Abertos'}
                             value={statistics.openReports}/>
            </Grid>
          )}
          {permissions && (permissions.superadmin || permissions.admin || permissions.moderator) && (
            <Grid item sm={12} md={4} lg>
              <DashboardCard icon={'announcement'} bgColor={'#B00020'} title={'Denuncias em Aberto'}
                             value={statistics.openDenounces}/>
            </Grid>
          )}
          {permissions && (permissions.superadmin || permissions.admin || permissions.moderator) && (
            <Grid item sm={12} md={4} lg>
              <DashboardCard icon={'check_circle_outline'} bgColor={'#558b2f'} title={'Relatos aguardando aprovação'}
                             value={statistics.openReports}/>
            </Grid>
          )}
        </Grid>

        <Card className={classes.reportCard}>
          <CardHeader title="Últimos Relatos" subheader="São João Batista"/>
          <CardContent>
            <GridList cellHeight={250} className={classes.gridList} cols={3.5}>
              {reports.map((report, index) => (
                <GridListTile key={index}>
                  <img src={report.pictures[0]} alt={report.author.displayName}/>
                  <GridListTileBar
                    title={report.description}
                    classes={{ root: classes.titleBar, title: classes.title }}
                    actionIcon={(
                      <IconButton className={classes.icon} href={`#/reports/${report.id}/show`}>
                        <GoToIcon/>
                      </IconButton>
                    )}/>
                </GridListTile>
              ))}
            </GridList>
          </CardContent>
        </Card>
      </div>
    )
  }
}

const mapStateToProps = state => ({ version: state.admin.ui.viewVersion })

export default compose(connect(mapStateToProps), withDataProvider)(withStyles(styles)(Dashboard))

