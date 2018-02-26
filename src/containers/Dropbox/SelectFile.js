import React, { Component } from 'react';
// import {Button} from 'react-bootstrap'
// import FontAwesome from 'react-fontawesome'
import Dropbox from 'dropbox'
import {withCookies} from 'react-cookie'
import {withRouter} from 'react-router-dom'

import styled from 'styled-components'
import {Table, Button} from 'react-bootstrap'
import FontAwesome from 'react-fontawesome'
import LoadingSpinner from 'components/LoadingSpinner'

import {dirname, extname} from 'path'

const EntryRow = styled.tr`
  cursor: pointer;
  &:hover {
    background-color: #DDD;
  }
  &.uneditable-file {
    cursor: disabled;
    color: #999;
    font-style: italic;
    background-color: #FFF;
  }
`

const CurrentPathTitle = styled.h3`
  font-family: sans-serif;
  display: inline-block;
  float: left;
  margin: 0 15px 30px 0;
`

const CurrentPathActionsWrapper = styled.div`
  float:left;
`

const {REACT_APP_COOKIE_PREFIX} = process.env
const DROPBOX_COOKIE = `${REACT_APP_COOKIE_PREFIX}_dropbox_access_token`
const DROPBOX_LAST_PATH_COOKIE = `${REACT_APP_COOKIE_PREFIX}_dropbox_last_path`

class DropboxSelectFile extends Component {

  createClient = (cb) => {
    const {cookies, history} = this.props
    const accessToken = cookies.get(DROPBOX_COOKIE)
    // no access token? get out of here
    if (!accessToken) return history.push(`/dropbox/authenticate`)
    var dbx = new Dropbox.Dropbox({ accessToken })
    this.setState({dbx}, cb)
  }

  getEntriesAtPath = (path) => {
    this.setState({
      loading: true
    }, () => {
      const {dbx} = this.state
      return dbx.filesListFolder({path})
        .then(response => {
          console.log(response)
          this.setState({
            entries: response.entries
          })
        })
        .catch(this.handleDropboxError)
        .then(() => this.setState({loading: false}))
    })
  }

  setCurrentPath = (currentPath) => {
    const {cookies} = this.props
    if (currentPath === '/') currentPath = ''
    cookies.set(DROPBOX_LAST_PATH_COOKIE, currentPath)
    this.setState({currentPath})
  }

  getCurrentEntryMetadata = (state = this.state) => {
    const {dbx, currentPath} = state
    if (!currentPath) {
      return this.setState({currentEntry: null})
    }
    return dbx.filesGetMetadata({path: currentPath})
      .then(response => this.setState({currentEntry: response}))
      .catch(this.handleDropboxError)
  }

  handleClickEntry = (entry) => () => {
    const {cookies} = this.props
    const type = getEntryType(entry)
    switch (type) {
      case 'folder':
        // save the last folder we've been in to to props
        return this.setCurrentPath(entry.path_lower)
      case 'file':
      default:
        console.log('got file')
        console.log(entry)
    }
  }

  handleClickEntryParent = () => {
    const {currentPath} = this.state
    this.setCurrentPath(dirname(currentPath))
  }

  handleCreateNote = () => {
    const {currentPath, entries, dbx} = this.state
    const getUniqueNotePath = (index = 0) => {
      const notePath = `${currentPath}/Untitled Note${index ? ` ${index}` : ''}.md.securenote`
      if (entries.find(entry => entry.path_lower === notePath)) return getUniqueNotePath(index + 1)
      return notePath
    }
    // check for filename collisions
    const notePath = getUniqueNotePath()
    // upload an empty note
    return dbx.filesUpload({
      contents: '',
      path: notePath
    })
      .then(response => {
        console.log(response)
      })
      .catch(this.handleDropboxError)
  }

  handleDropboxError = (err) => {
    console.error(err)
    this.setState({dropboxError: err.message || err.toString()})
  }

  componentWillUpdate (nextProps, nextState) {
    const {currentPath} = this.state
    const {currentPath: nextCurrentPath} = nextState
    if (nextCurrentPath !== currentPath) {
      this.getEntriesAtPath(nextCurrentPath)
      this.getCurrentEntryMetadata(nextState)
    }
  }

  componentWillMount = () => {
    const {cookies} = this.props
    const initialPath = cookies.get(DROPBOX_LAST_PATH_COOKIE) || ''
    this.createClient(() => this.setCurrentPath(initialPath))
  }

  render = () => {
    const {loading, entries, currentEntry} = this.state
    if (loading) return <LoadingSpinner />
    if (!entries) return <p>No files!</p>
    return <div>
      <CurrentPathTitle>{currentEntry ? currentEntry.path_display : '/'}</CurrentPathTitle>
      <CurrentPathActionsWrapper>
        <Button bsStyle='primary' onClick={this.handleCreateNote}>Create note here <FontAwesome name='plus' /></Button>
      </CurrentPathActionsWrapper>
      <EntriesTable
        Entries={entries}
        onClickEntry={this.handleClickEntry}
        onClickEntryParent={this.handleClickEntryParent}
        currentPath={currentEntry}
      />
    </div>
  }
}

const EntriesTable = ({Entries, onClickEntry, onClickEntryParent, currentPath}) => <Table>
  <thead>
    <tr>
      <th>Type</th>
      <th>Name</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    {!!currentPath && <EntryRow onClick={onClickEntryParent}>
      <td><FontAwesome name='arrow-left' /></td>
      <td colSpan='2'>../ (up one level)</td>
    </EntryRow>}
    {Entries.map(entry => {
      const fileType = getEntryFileType(entry)
      console.log(fileType)
      return <EntryRow
        key={entry.id}
        onClick={onClickEntry(entry)}
        className={fileType}
      >
        <td><FontAwesome name={getIconFromFileType(fileType)} /></td>
        <td>{entry.name}</td>
        <td>{fileType === 'text-file' && <Button>Encrypt <FontAwesome name='lock' /></Button>}</td>
      </EntryRow>
    })}
  </tbody>
</Table>

const getEntryType = (entry) => entry['.tag']

const getEntryFileType = (entry) => {
  if (getEntryType(entry) === 'folder') return 'folder'
  switch(extname(entry.path_lower)) {
    case '.securenote':
      return 'securenote'
    case '.txt':
    case '.md':
      return 'text-file'
    default:
      return 'uneditable-file'
  }
}

const getIconFromFileType = (fileType) => {
  switch (fileType) {
    case 'folder':
      return 'folder'
    default:
      return 'file'
  }
}

export default withRouter(withCookies(DropboxSelectFile))
