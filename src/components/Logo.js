import React from 'react'
import styled from 'styled-components'

const Square = styled.div`
  width: ${props => props.width ? `${props.width}px` : `100%`};
  position: relative;
  display: inline-block;
`

const Logo = ({width, className}) => <Square width={width} className={className}>
  <img src='/secure-notes-logo.svg' className='img-responsive' alt='Secure Notes logo' title='Secure Notes' />
</Square>

export default Logo
