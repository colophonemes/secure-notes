import React, { Component } from 'react';
import {Grid, Alert} from 'react-bootstrap'
// Layout
import { BrowserRouter as Router} from "react-router-dom"
import {Navigation, Routes} from 'components/Navigation'
import {CookiesProvider} from 'react-cookie'
import DropboxProvider from 'providers/Dropbox'


class App extends Component {

  checkCrypto = () => !!(window.crypto || window.msCrypto)

  render() {
    const hasCrypto = this.checkCrypto
    return (
      <Router>
        <CookiesProvider>
          <DropboxProvider>
            <Grid>
              <Navigation />
              {!hasCrypto && <NoCryptoMessage />}
              {hasCrypto && <Routes />}
            </Grid>
          </DropboxProvider>
        </CookiesProvider>
      </Router>
    )
  }
}

const NoCryptoMessage = () => <Grid><Alert bsStyle='danger'>
  <h4>Browser Crypto not supported</h4>
  <p>Your browser must support the{' '}
    <a href='https://developer.mozilla.org/en-US/docs/Web/API/Window/crypto'>
      `Window.crypto` property
    </a>. Try upgrading your browser.
  </p>
</Alert></Grid>

export default App
