import React, { Component } from 'react';
import {Button} from 'react-bootstrap'
import FontAwesome from 'react-fontawesome'
import Dropbox from 'dropbox'
import {withCookies} from 'react-cookie'
import {withRouter} from 'react-router-dom'

const {
  REACT_APP_DROPBOX_CLIENT_ID,
  REACT_APP_BASE_URL,
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
    constructor (props) {
      super(props)
      var dbx = new Dropbox.Dropbox({ clientId: REACT_APP_DROPBOX_CLIENT_ID })
      var authUrl = dbx.getAuthenticationUrl(`${REACT_APP_BASE_URL}/${props.match.url}/authenticate`)
      this.state = {authUrl}
    }
    // Parses the url and gets the access token if it is in the urls hash
    checkToken (props) {
      const {hash} = window.location
      const {cookies, history, match} = props
      // try to get the hash from cookies
      let accessToken = cookies.get(DROPBOX_COOKIE)
      console.log(accessToken)
      if (hash) {
        // if we've got a hash, use that as the access token
        accessToken = getHashParams(hash).access_token
        cookies.set(DROPBOX_COOKIE, accessToken)
      }
      // if we've got an access token, go to the file selector
      if (accessToken) {
        history.push(`${match.url}/select-file`)
      }
    }

    componentWillMount = () => {
      this.checkToken(this.props)
    }

    componentWillReceiveProps = (newProps) => {
      this.checkToken(newProps)
    }

    render = () => {
      const {authUrl} = this.state
      return <Button href={authUrl} bsStyle='primary'>
        Link Dropbox Account <FontAwesome name='dropbox' />
      </Button>
    }
}

export default withRouter(withCookies(DropboxAuth))
