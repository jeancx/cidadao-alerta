import React from 'react'
import { Route } from 'react-router-dom'
import ReportsMap from './pages/ReportsMap'
import Profile from './pages/Profile'

export default [
  <Route exact path="/profile" component={Profile}/>,
  <Route exact path="/map" component={ReportsMap}/>
]