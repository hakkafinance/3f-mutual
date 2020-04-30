import React from 'react'
import styled from 'styled-components'

const InputField = styled.div`
  margin-bottom: 1.5rem;
`

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  margin-left: 1rem;
  font-size: 1rem;
`

const Input = styled.input`
  display: block;
  width: 100%;
  height: ${({ height }) => height || '3rem'};
  border: 2px solid ${({ theme }) => theme.colors.gray};
  border-radius: 0.25rem;
  padding: 0.75rem 1rem;
  background-color: ${({ theme }) => theme.colors.white};
  font-size: 1rem;
  display: flex;
  align-items: center;
`

export default function TextField(props) {
  const { label = '', multiline = false, ...inputProps } = props

  return (
    <InputField>
      <Label>{label}</Label>
      <Input as={multiline ? 'textarea' : 'input'} {...inputProps} />
    </InputField>
  )
}
