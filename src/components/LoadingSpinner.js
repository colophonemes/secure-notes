import React from 'react'
import styled from 'styled-components'
import FontAwesome from 'react-fontawesome'

// Here we create a component that will rotate everything we pass in over two seconds
const Wrapper = styled.div`
  text-align: center;
`

const StyledFontAwesome = styled(FontAwesome)`
  color: #666;
  font-size: 40px;
`;
const LoadingSpinner = () => <Wrapper>
  <StyledFontAwesome className='fa-pulse' name='spinner' />
</Wrapper>

export default LoadingSpinner
