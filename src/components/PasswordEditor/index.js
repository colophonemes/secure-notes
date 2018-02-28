import React, {Component} from 'react'

import PasswordStrengthMeter from './PasswordStrengthMeter'

import styled from 'styled-components'
import {
  Row,
  Col,
  Form,
  FormGroup,
  FormControl,
  Checkbox,
  InputGroup,
  Button,
  Modal
} from 'react-bootstrap'
import FontAwesome from 'react-fontawesome'

import {deriveKey} from 'utils/crypto'

class PasswordEditor extends Component {

  constructor (props) {
    super(props)
    this.state = {
      password: '',
      savePassword: true,
      showPassword: false
    }
  }

  handlePasswordChange = (event) =>
    this.setState({password: event.target.value})

  handleSavePasswordChange = (event) =>
    this.setState({savePassword: event.target.checked})

  handleSubmit = async (event) => {
    event.preventDefault()
    const {onSubmit} = this.props
    const {password, savePassword} = this.state
    const key = await deriveKey(password)
    if (typeof onSubmit === 'function') onSubmit(key)
  }

  handleCancel = () => {
    const {onCancel} = this.props
    if (typeof onCancel === 'function') onCancel()
  }

  handleShowPassword = () => this.setState({showPassword: !this.state.showPassword})

  render (){
    const {password, savePassword, showPassword} = this.state
    return <Form onSubmit={this.handleSubmit} className='center'>
      <FormGroup>
        <InputGroup>
          <InputGroup.Addon>
            <FontAwesome name='lock' />
          </InputGroup.Addon>
          <FormControl
            type={showPassword ? 'input' : 'password'}
            className='center'
            placeholder='Password'
            value={password}
            onChange={this.handlePasswordChange}
          />
          <InputGroup.Addon onClick={this.handleShowPassword}>
            <FontAwesome name={showPassword ? 'eye-slash' : 'eye'} />
          </InputGroup.Addon>
        </InputGroup>
        <PasswordStrengthMeter password={password} />
      </FormGroup>
      {/*<FormGroup>
        <Checkbox checked={savePassword} onChange={this.handleSavePasswordChange}>Save password on this device</Checkbox>
      </FormGroup>*/}
      <FormGroup>
        <Row>
          <Col xs={6}>
            <Button block bsStyle='default' onClick={this.handleCancel}>Cancel <FontAwesome name='times' /></Button>
          </Col>
          <Col xs={6}>
            <Button block disabled={!password} bsStyle='primary' type='submit'>Use password <FontAwesome name='check' /></Button>
          </Col>
        </Row>
      </FormGroup>
    </Form>
  }
}

export const PasswordEditorModal = ({show, onHide, onSubmit, onCancel}) => <Modal {...{show, onHide}}>
    <Modal.Header><h4 className='center'>Enter Password</h4></Modal.Header>
    <Modal.Body>
      <div className='center'>
        <p>Set the password you will use to open this file.</p>
        {/*<p>If you save your password you'll be able to use it to encrypt other files</p>*/}
      </div>
      <PasswordEditor onSubmit={onSubmit} onCancel={onCancel} />
    </Modal.Body>
  </Modal>

export default PasswordEditor
