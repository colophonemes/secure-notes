import React, { Component } from 'react'
import PropTypes from 'prop-types'
// lib
import Dropbox from 'dropbox'
import {withCookies} from 'react-cookie'
import {Button} from 'react-bootstrap'
import FontAwesome from 'react-fontawesome'


const {
  REACT_APP_DROPBOX_CLIENT_ID,
  REACT_APP_COOKIE_PREFIX,
  REACT_APP_BASE_URL
} = process.env
const DROPBOX_COOKIE = `${REACT_APP_COOKIE_PREFIX}_dropbox_access_token`

export class _DropboxProvider extends Component {
  static childContextTypes = {
    dbx: PropTypes.object
  }

  createClient () {
    const {cookies} = this.props
    const accessToken = cookies.get(DROPBOX_COOKIE)
    // no access token? get out of here
    if (!accessToken) return this.setState({dbx: null})
    const dbx = new Dropbox.Dropbox({ accessToken })
    this.setState({dbx})
  }

  componentWillMount () {
    this.createClient()
  }

  componentWillReceiveProps (newProps) {
    if (!newProps.dbx) this.createClient()
  }

  getChildContext() {
    return {dbx: this.state.dbx}
  }

  render() {
    return <div>{this.props.children}</div>
  }
}

// withdropbox context consumer
export const withDropbox = WrappedComponent => {
  return class withDropboxHOC extends Component {
    static contextTypes = {dbx: PropTypes.object}
    render () {
      const {dbx} = this.context
      // if we don't have a configured client, we need to connect to Dropbox
      if (!dbx) {
        const _dbx = new Dropbox.Dropbox({ clientId: REACT_APP_DROPBOX_CLIENT_ID })
        const authURL = _dbx.getAuthenticationUrl(`${REACT_APP_BASE_URL}/dropbox/authenticate`)
        return <div className='center'>
          <Button href={authURL} bsStyle='primary'>
            Link Dropbox account <FontAwesome name='dropbox' />
          </Button>
        </div>
      }
      return <WrappedComponent {...this.props} dbx={dbx} />
    }
  }
}

export default withCookies(_DropboxProvider)
