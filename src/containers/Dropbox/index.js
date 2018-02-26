import React, { Component } from 'react';
import { Route, withRouter } from 'react-router-dom'
import {withCookies} from 'react-cookie'
// route components
import DropboxAuth from './Authenticate'
import DropboxSelectFile from './SelectFile'


const {
  REACT_APP_COOKIE_PREFIX
} = process.env
const DROPBOX_COOKIE = `${REACT_APP_COOKIE_PREFIX}_dropbox_access_token`


// authentication code from https://github.com/dropbox/dropbox-sdk-js/blob/master/examples/javascript/auth/index.html
class DropboxHome extends Component {

  checkAuthenticated = ({history, match, cookies}) => {
    console.log(`checking authenticated at Home level`)
    // only run the check if we're on the base URL
    if (!/^\/dropbox\/?$/.test(match.url)) return
    // get the access token from cookies
    const accessToken = cookies.get(DROPBOX_COOKIE)
    if (!accessToken) {
      history.push(`/dropbox/authenticate`)
    } else {
      history.push(`/dropbox/select-file`)
    }
  }

  componentWillMount = () => {
    this.checkAuthenticated(this.props)
  }

  render = () => <div>
    <Route exact path={`/dropbox/authenticate`} component={DropboxAuth} />
    <Route exact path='/dropbox/select-file' component={DropboxSelectFile} />
  </div>
}

export default withCookies(withRouter(DropboxHome))
