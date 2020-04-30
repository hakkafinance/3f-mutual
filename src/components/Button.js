import styled, { keyframes } from 'styled-components'

const pulse = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(23, 162, 184, 0.8);
  }
  100% {
    box-shadow: 0 0 0 10px rgba(23, 162, 184, 0);
  }
`

const Button = styled.button`
  display: block;
  width: 100%;
  height: 3rem;
  border: 0;
  border-radius: 0.25rem;
  background-color: ${({ theme }) => theme.colors.buttonBackground};
  color: ${({ theme }) => theme.colors.buttonText};
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  animation: ${pulse} 1s infinite;

  &[disabled] {
    background-color: ${({ theme }) => theme.colors.gray};
    cursor: not-allowed;
    animation: none;
  }
`

export default Button
