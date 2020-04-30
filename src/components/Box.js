import styled, { css } from 'styled-components'

const Box = styled.div`
  ${props => css`
    width: 100%;
    max-width: ${props.maxWidth};
    min-height: ${props.minHeight};
    margin-top: ${(props.mt || props.my || 0) / 2}rem;
    margin-left: ${(props.ml || props.mx || 0) / 2}rem;
    margin-bottom: ${(props.mb || props.my || 0) / 2}rem;
    margin-right: ${(props.mr || props.mx || 0) / 2}rem;
    padding-top: ${(props.pt || props.py || 0) / 2}rem;
    padding-left: ${(props.pl || props.px || 0) / 2}rem;
    padding-bottom: ${(props.pb || props.py || 0) / 2}rem;
    padding-right: ${(props.pr || props.px || 0) / 2}rem;
    display: ${props.flex ? 'flex' : 'block'};
    flex-direction: ${props.direction};
    flex-wrap: ${props.wrap};
    justify-content: ${props.justifyContent};
    align-items: ${props.alignItems};
  `}
`

export default Box
