import React, { Component } from 'react';
// import {Button} from 'react-bootstrap'
// import FontAwesome from 'react-fontawesome'
import {withCookies} from 'react-cookie'
import {withRouter} from 'react-router-dom'
import {withDropbox} from 'providers/Dropbox'

import {Row, Col, Button} from 'react-bootstrap'
import FontAwesome from 'react-fontawesome'
import LoadingSpinner from 'components/LoadingSpinner'

import {encrypt, decrypt} from './encryption'

import DraftEditor from 'draft-js-plugins-editor';
import {
  // Editor as DraftEditor,
  EditorState as DraftEditorState,
  convertFromRaw, convertToRaw
} from 'draft-js'
import {markdownToDraft, draftToMarkdown} from 'markdown-draft-js'
import createMarkdownShortcutsPlugin from 'draft-js-markdown-shortcuts-plugin';
const plugins = [
  createMarkdownShortcutsPlugin()
]


class Editor extends Component {

  constructor (props) {
    super(props)
    this.state = {
      editorState: DraftEditorState.createEmpty(),
      password: 'super-secret-password'
    }
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
    const {editorState, password} = this.state
    const markdownString = draftToMarkdown(convertToRaw(editorState.getCurrentContent()))
    console.log(markdownString)
    return encrypt(markdownString, password)
  }

  getDecryptedContents = (state = this.state) => {
    const {encryptedContents, password} = state
    return decrypt(encryptedContents, password)
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

  componentWillMount () {
    this.loadFile()
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
    }
  }

  render () {
    const {loading, saving, editorState} = this.state
    if (loading) return <LoadingSpinner />
    return <div>
      <Row>
        <Col md={8} mdOffset={2}>
          <DraftEditor
            editorState={editorState}
            onChange={this.handleDraftEditorChange}
            readOnly={saving}
            plugins={plugins}
          />
          <Row className='center'>
            <Col md={6} mdOffset={3}>
              <Button block bsStyle='primary' onClick={this.handleSave}>Save <FontAwesome name='check' /></Button>
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  }
}

export default withCookies(withRouter(withDropbox(Editor)))
