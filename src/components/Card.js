import styled from 'styled-components'

const Card = styled.div`
  width: 100%;
  max-width: 37.5rem;
  border-radius: 0.5rem;
  background-color: ${({ theme }) => theme.colors.white};
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
`

export default Card
