import styled, { css } from 'styled-components'

const Container = styled.div`
  ${props => css`
    width: 100%;
    max-width: ${props.maxWidth || '1280px'};
    margin: 0 auto;
    padding: 0 1.5rem;
    display: ${props.flex ? 'flex' : 'block'};
    flex-direction: ${props.direction};
    flex-wrap: ${props.wrap};
    justify-content: ${props.justifyContent};
    align-items: ${props.alignItems};
  `}
`

export default Container
