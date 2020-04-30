import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import Container from './Container'
import Web3Status from './Web3Status'
import Text from './Text'
import { ReactComponent as LogoIcon } from '../assets/logo.svg'
import { ReactComponent as ClockIcon } from '../assets/clock.svg'
import { formatUTC0 } from '../utils'

const HeaderWrapper = styled.header`
  position: fixed;
  z-index: 20;
  width: 100vw;
  height: 4rem;
  background-color: ${({ theme }) => theme.colors.headerBackground};
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
  display: flex;
`

const HeaderSpace = styled.div`
  height: 4rem;
`

const LogoWrapper = styled.div`
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.colors.white};

  > *:not(:first-child) {
    margin-left: 0.5rem;
  }
`

const LogoText = styled.div`
  margin: 0;
  font-size: 1.5rem;
`

const HeaderGroup = styled.div`
  display: flex;
  align-items: center;

  > *:not(:first-child) {
    margin-left: 1rem;
  }
`

const Link = styled.a`
  border-bottom: 2px solid ${({ theme }) => theme.colors.white};
  padding-bottom: 0.25rem;
  color: ${({ theme }) => theme.colors.white};
  font-size: 1rem;
  text-decoration: none;
  display: none;

  ${({ theme }) => theme.mediaQuery.sm`
    display: inline-block;
  `}
`

const StyledClockIcon = styled(ClockIcon)`
  color: ${({ theme }) => theme.colors.white};
`

const ClockWrapper = styled.div`
  font-family: 'roboto';
  color: ${({ theme }) => theme.colors.white};
  display: none;

  > ${Text} {
    color: ${({ theme }) => theme.colors.white};
  }

  > *:not(:first-child) {
    margin-left: 0.5rem;
  }

  ${({ theme }) => theme.mediaQuery.sm`
    display: flex;
    align-items: center;
  `}
`

const targetAsset = process.env.REACT_APP_TARGET_ASSET

export default function Header() {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const timeout = setTimeout(() => setNow(Date.now()), 1000)
    return () => {
      clearTimeout(timeout)
    }
  }, [now])

  return (
    <>
      <HeaderWrapper>
        <Container flex justifyContent='space-between' alignItems='center'>
          <HeaderGroup>
            <LogoWrapper>
              <LogoIcon />
              <LogoText>3F Mutual ({targetAsset})</LogoText>
            </LogoWrapper>
            <ClockWrapper>
              <StyledClockIcon />
              <Text>{formatUTC0(now)}</Text>
            </ClockWrapper>
          </HeaderGroup>
          <HeaderGroup>
            <Link href='https://3fmutual.hostedwiki.co/' target='_blank'>
              Wiki
            </Link>
            <Web3Status />
          </HeaderGroup>
        </Container>
      </HeaderWrapper>
      <HeaderSpace />
    </>
  )
}
