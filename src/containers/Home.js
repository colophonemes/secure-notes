import React, { Component } from 'react';
import {Row, Col} from 'react-bootstrap'
import ButtonLink from 'components/ButtonLink'
import styled from 'styled-components'
import FontAwesome from 'react-fontawesome'
import Logo from 'components/Logo'

const TitleWrapper = styled.div`
  text-align: center;
  .site-title-logo {
    width: 46px;
    margin-bottom: -10px;
  }
`

const SiteTitle = styled.h1`
  font-size: 40px;
  text-decoration: underline;
  margin: 0 0 30px 5px;
  display: inline-block;
`

class Home extends Component {
  render () {
    return <div>
      <Row>
        <Col md={6} mdOffset={3}>
          <TitleWrapper>
            <Logo className='site-title-logo' />
            <SiteTitle>Secure Notes</SiteTitle>
          </TitleWrapper>

          <p>A browser-based application for writing encrypted notes.</p>
          <p><strong>Simple:</strong> Store documents in a Dropbox folder.</p>
          <p><strong>Shareable:</strong> Just share your Dropbox folder, easy!</p>
          <p>
            <strong>Secure:</strong> Uses WebCrypto to encrypt your data in-browser using AES,{' '}
            so your passwords never leave your computer, and no third-party can decrypt your{' '}
            notes without the password.
          </p>
          <ButtonLink block bsStyle='primary' to='/select-file'>Get started <FontAwesome name='dropbox' /></ButtonLink>
          <hr />
          <h3>Warning</h3>
          <p>
            This software is provided with absolutely no warranty.{' '}
            The cryptographic implementation (while based on WebCrypto) has not been validated{' '}
            and you use the service entirely at your own risk. If you actually need to send secret{' '}
            messages, use something like GPG instead!
          </p>

          <p><a href='https://github.com/colophonemes/secure-notes'>Github project</a></p>
        </Col>
      </Row>

    </div>
  }
}

export default Home
