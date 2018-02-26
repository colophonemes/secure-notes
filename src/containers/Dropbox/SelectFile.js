import React, { Component } from 'react';
// import {Button} from 'react-bootstrap'
// import FontAwesome from 'react-fontawesome'
import {withCookies} from 'react-cookie'
import {withRouter} from 'react-router-dom'
import {withDropbox} from 'providers/Dropbox'
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
    cursor: not-allowed;
    color: #999;
    font-style: italic;
    background-color: #FFF;
  }
`

const CurrentPathTitle = styled.h3`
  font-family: sans-serif;
  display: inline-block;
  float: left;
  margin: 0 0 30px 0;
`

const CurrentPathActionsWrapper = styled.div`
  float:left;
  .btn {
    margin-left: 15px;
  }
`

const {REACT_APP_COOKIE_PREFIX} = process.env
const DROPBOX_LAST_PATH_COOKIE = `${REACT_APP_COOKIE_PREFIX}_dropbox_last_path`

class DropboxSelectFile extends Component {

  getEntriesAtPath = (path) => {
    this.setState({
      loading: true
    }, () => {
      const {dbx} = this.props
      return dbx.filesListFolder({path})
        .then(response => this.setState({
          entries: response.entries
        }))
        .catch(this.handleDropboxError)
        .then(() => this.setState({loading: false}))
    })
  }

  getCurrentEntryMetadata = (currentPath) => {
    const {dbx} = this.props
    if (!currentPath) {
      return this.setState({currentEntry: null})
    }
    return dbx.filesGetMetadata({path: currentPath})
      .then(response => this.setState({currentEntry: response}))
      .catch(this.handleDropboxError)
  }

  loadDataAtPath = (path) => Promise.all([
    this.getEntriesAtPath(path),
    this.getCurrentEntryMetadata(path)
  ])

  setCurrentPath = (currentPath) => {
    const {cookies} = this.props
    if (currentPath === '/') currentPath = ''
    cookies.set(DROPBOX_LAST_PATH_COOKIE, currentPath)
    this.setState({currentPath})
  }


  handleClickEntry = (entry) => () => {
    const type = getEntryFileType(entry)
    switch (type) {
      case 'folder':
        // save the last folder we've been in to to props
        return this.setCurrentPath(entry.path_lower)
      case 'securenote':
        this.editFile(entry)
        break
      case 'text-file':
        console.log('got text file')
        console.log(entry)
        break
      default:
        // do nothing
    }
  }

  handleClickEntryParent = () => {
    const {currentPath} = this.state
    this.setCurrentPath(dirname(currentPath))
  }

  handleRefreshEntries = () => this.getEntriesAtPath(this.state.currentPath)

  handleCreateNote = () => {
    const {dbx} = this.props
    const {currentPath, entries} = this.state
    const getUniqueNotePath = (index = 0) => {
      const notePath = `${currentPath}/Untitled Note${index ? ` ${index}` : ''}.md.securenote`
      if (entries.find(entry => entry.path_lower === notePath.toLowerCase())) return getUniqueNotePath(index + 1)
      return notePath
    }
    // check for filename collisions
    const notePath = getUniqueNotePath()
    // upload an empty note
    return dbx.filesUpload({
      contents: '',
      path: notePath
    })
      .then(this.editFile)
      .catch(this.handleDropboxError)
  }

  handleDropboxError = (err) => {
    console.error(err)
    this.setState({dropboxError: err.message || err.toString()})
  }

  editFile = (entry) => {
    const {history} = this.props
    history.push(`/editor?file=${entry.path_lower}`)
  }

  componentWillUpdate (nextProps, nextState) {
    const {currentPath} = this.state
    const {currentPath: nextCurrentPath} = nextState
    if (nextCurrentPath !== currentPath) {
      return this.loadDataAtPath(nextCurrentPath)
    }
  }

  componentWillMount = () => {
    const {cookies} = this.props
    const initialPath = cookies.get(DROPBOX_LAST_PATH_COOKIE) || ''
    this.setCurrentPath(initialPath)
    this.loadDataAtPath(initialPath)
  }

  render = () => {
    const {loading, entries, currentEntry} = this.state
    if (loading) return <LoadingSpinner />
    if (!entries) return <p>No files!</p>
    return <div>
      <CurrentPathTitle>
        <FontAwesome name='dropbox' />{' '}
        {currentEntry ? currentEntry.path_display : <em>Your Dropbox</em>}
      </CurrentPathTitle>
      <CurrentPathActionsWrapper>
        <Button bsStyle='primary' onClick={this.handleCreateNote}>Create note here <FontAwesome name='plus' /></Button>
        <Button bsStyle='default' onClick={this.handleRefreshEntries}><FontAwesome name='refresh' /></Button>
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
      <th>Name</th>
    </tr>
  </thead>
  <tbody>
    {!!currentPath && <EntryRow onClick={onClickEntryParent}>
      <td><FontAwesome name='arrow-left' /> <em>back to parent folder</em></td>
    </EntryRow>}
    {!Entries.length && <tr><td><em>(folder empty)</em></td></tr>}
    {Entries.map(entry => {
      const fileType = getEntryFileType(entry)
      return <EntryRow
        key={entry.id}
        onClick={onClickEntry(entry)}
        className={fileType}
      >
        <td><EntryIcon fileType={fileType} /> {entry.name}</td>
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

const EntryIcon = ({fileType}) => <FontAwesome name={fileType === 'folder' ? 'folder' : 'file-o'} />

export default withDropbox(withCookies(withRouter(DropboxSelectFile)))
