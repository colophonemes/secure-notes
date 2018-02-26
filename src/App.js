import React, { Component } from 'react';
import {Grid} from 'react-bootstrap'
// Layout
import { BrowserRouter as Router} from "react-router-dom"
import {Navigation, Routes} from 'components/Navigation'
import {CookiesProvider} from 'react-cookie'


class App extends Component {
  render() {
    return (
      <Router>
        <CookiesProvider>
          <Grid>
            <Navigation />
            <Routes />
          </Grid>
        </CookiesProvider>
      </Router>
    )
  }
}

export default App
