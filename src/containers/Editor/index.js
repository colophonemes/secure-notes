import React, { Component } from 'react';
// import {Button} from 'react-bootstrap'
// import FontAwesome from 'react-fontawesome'
import {withCookies} from 'react-cookie'
import {withRouter} from 'react-router-dom'
import {withDropbox} from 'providers/Dropbox'

import {PasswordEditorModal} from 'components/PasswordEditor'

import {Row, Col, Button} from 'react-bootstrap'
import ButtonLink from 'components/ButtonLink'
import FontAwesome from 'react-fontawesome'
import LoadingSpinner from 'components/LoadingSpinner'
import styled from 'styled-components'

import {deriveKey, encrypt, decrypt} from 'utils/crypto'

import DraftEditor from 'draft-js-plugins-editor';
import {
  // Editor as DraftEditor,
  EditorState as DraftEditorState,
  convertFromRaw, convertToRaw
} from 'draft-js'
import {markdownToDraft, draftToMarkdown} from 'markdown-draft-js'
import createRichButtonsPlugin from 'draft-js-richbuttons-plugin'
// import createMarkdownShortcutsPlugin from 'draft-js-markdown-shortcuts-plugin';
const richButtonsPlugin = createRichButtonsPlugin()
const {BoldButton, ItalicButton, H2Button, ULButton, OLButton} = richButtonsPlugin
const plugins = [
  richButtonsPlugin,
  // createMarkdownShortcutsPlugin()
]

const DraftEditorWrapper = styled.div`
  .DraftEditor-root {
    border: 1px solid #DDD;
    padding: 15px;
    margin: 5px 0 15px;
  }
`

const initialState = {
  editorState: DraftEditorState.createEmpty(),
  encryptedContents: null,
  key: null,
  showPasswordEditor: true
}

class Editor extends Component {

  constructor (props) {
    super(props)
    this.state = initialState
  }

  getFilePath = () => {
    const {location} = this.props
    const searchQuery = new URLSearchParams(location.search)
    const path = searchQuery.get('file')
    return path
  }

  loadFile = () => {
    const path = this.getFilePath()
    const {dbx} = this.props
    this.setState({loading: true}, () => {
      return dbx.filesGetTemporaryLink({path})
        .then(dbxResponse => fetch(dbxResponse.link))
        .then(fetchResponse => fetchResponse.text())
        .then(encryptedContents => this.setState({encryptedContents}))
        .catch(err => console.error(err))
        .then(() => this.setState({loading: false}))
    })
  }

  handleChangeDecryptedContents = (event) => {
    this.setState({decryptedContents: event.target.value})
  }

  getEncryptedContents = () => {
    const {editorState, key} = this.state
    const markdownString = draftToMarkdown(convertToRaw(editorState.getCurrentContent()))
    return encrypt(markdownString, key)
  }

  getDecryptedContents = async (state = this.state) => {
    const {encryptedContents, key} = state
    if (!encryptedContents || !encryptedContents.trim()) return ''
    return await decrypt(encryptedContents, key)
  }

  handleDraftEditorChange = (editorState) => this.setState({editorState})

  handleSave = () => {
    const {dbx} = this.props
    this.setState({saving: true}, () => {
      // get the encrypted contents
      return this.getEncryptedContents()
        // save to dropbox
        .then(encryptedContents => dbx.filesUpload({
          path: this.getFilePath(),
          contents: encryptedContents,
          mode: {
            '.tag': 'overwrite'
          }
        }))
        .then(response => console.log(response))
        .catch(err => console.error(err))
        .then(() => this.setState({saving: false}))
    })
  }

  handleSetKey = (key) =>  {
    if (key instanceof CryptoKey) this.setState({key, showPasswordEditor: false}, this.loadFile)
  }

  handleCancel = () => {
    const {history} = this.props
    history.push('/select-file')
  }

  componentWillUpdate (nextProps, nextState) {
    if (this.state.encryptedContents !== nextState.encryptedContents) {
      return this.getDecryptedContents(nextState)
        .then(decryptedContents => {
          const editorState = DraftEditorState.createWithContent(convertFromRaw(markdownToDraft(decryptedContents)))
          this.setState({
            decryptedContents,
            editorState
          })
        })
        .catch(err => {
          this.setState(initialState)
        })
    }
  }

  render () {
    const {loading, saving, editorState, showPasswordEditor} = this.state
    if (loading || saving) return <LoadingSpinner />
    return <div>
      <Row>
        <Col md={8} mdOffset={2}>
          <div>
            <div className="myToolbar">
              <BoldButton/>
              <ItalicButton/>

              <H2Button/>
              <ULButton/>
              <OLButton/>
            </div>
          </div>
          <DraftEditorWrapper>
            <DraftEditor
              editorState={editorState}
              onChange={this.handleDraftEditorChange}
              readOnly={saving}
              plugins={plugins}
            />
          </DraftEditorWrapper>
          <Row className='center'>
            <Col sm={6}>
              <Button block bsStyle='primary' onClick={this.handleSave}>Save <FontAwesome name='check' /></Button>
            </Col>
          </Row>
        </Col>
      </Row>
      <PasswordEditorModal show={showPasswordEditor} onSubmit={this.handleSetKey} onCancel={this.handleCancel} />
    </div>
  }
}

export default withCookies(withRouter(withDropbox(Editor)))
