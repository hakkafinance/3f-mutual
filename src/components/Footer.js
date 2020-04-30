import React from 'react'
import styled from 'styled-components'
import { INSURANCE_ADDRESSES } from '../constants'

const FooterWrapper = styled.footer`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;

  > *:not(:first-child) {
    margin-left: 1rem;
  }
`

const Link = styled.a`
  padding: 0.5rem;
  border-radius: 0.25rem;
  text-decoration: none;
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.buttonBackground};

  &:hover {
    background-color: rgba(0, 0, 0, 0.1);
  }
`

export default function Footer() {
  return (
    <FooterWrapper>
      <Link href='https://hakka.finance/' target='_blank'>Hakka Finance</Link>
      <Link href={`https://etherscan.io/address/${INSURANCE_ADDRESSES[1]}`} target='_blank'>Contract Adddress</Link>
      <Link href='https://discord.gg/cU4D2a8'>Discord</Link>
    </FooterWrapper>
  )
}