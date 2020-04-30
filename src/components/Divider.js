import styled from 'styled-components'

const Divider = styled.div`
  width: 100%;
  height: 1px;
  background-color: ${({ theme }) => theme.colors.divider};
`

export default Divider
