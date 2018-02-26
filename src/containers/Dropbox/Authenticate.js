import React, { Component } from 'react';
import {withCookies} from 'react-cookie'
import {withRouter} from 'react-router-dom'

const {
  REACT_APP_COOKIE_PREFIX
} = process.env

const DROPBOX_COOKIE = `${REACT_APP_COOKIE_PREFIX}_dropbox_access_token`

const getHashParams = (hash) => hash
  .replace('#', '')
  .split('&')
  .reduce((hashParams, section) => {
    const parts = section.split('=')
    hashParams[parts[0]] = parts[1]
    return hashParams
  }, {})

class DropboxAuth extends Component {
    // Parses the url and gets the access token if it is in the urls hash
    checkToken (props) {
      const {hash} = window.location
      const {cookies, history} = props
      // try to get the hash from cookies
      if (!hash) return
      const accessToken = getHashParams(hash).access_token
      if (!accessToken) return
      // if we've got an access token, save it, then redirect to the file selector
      cookies.set(DROPBOX_COOKIE, accessToken, {path: '/'})
      history.push(`/select-file`)
    }

    componentWillMount = () => {
      this.checkToken(this.props)
    }

    componentWillReceiveProps = (newProps) => {
      this.checkToken(newProps)
    }

    render = () => <p>Saving Dropbox token...</p>
}

export default withRouter(withCookies(DropboxAuth))
