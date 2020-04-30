import styled from 'styled-components'

const Text = styled.p`
  margin: 0;
  font-size: 1rem;
  letter-spacing: 1px;
  color: ${({ theme, error }) =>
    error ? theme.colors.error : theme.colors.textColor};

  &:not(:last-child) {
    margin-bottom: 1rem;
  }
`

export default Text
