import React from 'react'
import owaspPasswordStrengthTest from 'owasp-password-strength-test'
import {ProgressBar} from 'react-bootstrap'
import styled from 'styled-components'
const PasswordStrengthMeterWrapper = styled.div`
  .progress {
    height: ${props => props.show ? '10px' : '0'};
    transition: height 0.3s ease-in;
  }
`

export default function PasswordStrengthIndicator ({password}) {
  const {passedTests, failedTests} = owaspPasswordStrengthTest.test(password)
  const totalTests = (failedTests.length + passedTests.length)
  const totalPassedTests = passedTests.length
  const strength = password.length > 0 ? Math.floor((totalPassedTests / totalTests) * 100) : 0
  let style = 'danger'
  if (strength >= 70) style = 'warning'
  if (strength === 100) style = 'success'
  return <PasswordStrengthMeterWrapper show={(password && password.length > 0)}>
    <ProgressBar now={strength} bsStyle={style} />
  </PasswordStrengthMeterWrapper>
}
