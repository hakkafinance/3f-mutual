import React, { useState, useCallback } from 'react'
import { useWeb3React } from '@web3-react/core'
import styled from 'styled-components'
import { transparentize } from 'polished'
import ClickAwayListener from './ClickAwayListener'
import { injected, walletconnect } from '../connectors'
import { shortenAddress, getNetworkName } from '../utils'

const Button = styled.button`
  height: 2.5rem;
  border: 1px solid ${({ theme }) => theme.colors.white};
  border-radius: 0.25rem;
  padding: 0 1rem;
  background-color: transparent;
  color: ${({ theme }) => theme.colors.white};
  font-size: 0.75rem;
  font-weight: 500;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;

  &:hover {
    background-color: ${({ theme }) => transparentize(0.8, theme.colors.white)};
  }

  &:focus {
    outline-color: ${({ theme }) => theme.colors.indicator};
  }
`

const MenuWrapper = styled.div`
  position: relative;
`

const Menu = styled.div`
  position: absolute;
  right: 0;
  top: 3rem;
  width: 12rem;
  border-radius: 0.25rem;
  background-color: ${({ theme }) => theme.colors.white};
  box-shadow: 0 1rem 2rem rgba(0, 0, 0, 0.3);
  display: ${({ isOpen }) => (isOpen ? 'block' : 'none')};
`

const MenuHeader = styled.div`
  height: 2.5rem;
  padding: 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray};
  font-size: 0.75rem;
  display: flex;
  justify-content: center;
  align-items: center;
`

const MenuItem = styled.button`
  width: 100%;
  height: 2.5rem;
  border: 0;
  background-color: transparent;
  font-size: 1rem;
  font-weight: 500;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;

  &:hover {
    background-color: ${({ theme }) =>
      transparentize(0.95, theme.colors.black)};
  }

  &:focus {
    outline-color: ${({ theme }) => theme.colors.indicator};
  }

  > *:not(:first-child) {
    margin-left: 0.5rem;
  }
`

const ConnectorIndicator = styled.span`
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background-color: ${({ theme, active }) =>
    active ? theme.colors.success : theme.colors.error};
`

export default function Web3Status() {
  const {
    active,
    account,
    chainId,
    connector,
    activate,
    deactivate,
  } = useWeb3React()
  const [isOpen, setIsOpen] = useState(false)

  const isConnectedMetaMask = connector === injected
  const isConnectedWalletconnect = connector === walletconnect

  const connectMetaMask = useCallback(async () => {
    if (!isConnectedMetaMask) {
      await activate(injected)
    }
    setIsOpen(false)
  }, [activate, isConnectedMetaMask])

  const connectWalletconnect = useCallback(async () => {
    if (!isConnectedWalletconnect) {
      await activate(walletconnect)
    }
    setIsOpen(false)
  }, [activate, isConnectedWalletconnect])

  const disconnect = useCallback(() => {
    deactivate()
    setIsOpen(false)
  }, [deactivate])

  return (
    <ClickAwayListener onClickAway={() => setIsOpen(false)}>
      <MenuWrapper>
        <Button onClick={() => setIsOpen(!isOpen)}>
          {active ? shortenAddress(account) : 'Connect'}
        </Button>
        <Menu isOpen={isOpen}>
          {active && <MenuHeader>{getNetworkName(chainId)}</MenuHeader>}
          <MenuItem onClick={connectMetaMask}>
            <ConnectorIndicator active={isConnectedMetaMask} />
            <span>MetaMask</span>
          </MenuItem>
          <MenuItem onClick={connectWalletconnect}>
            <ConnectorIndicator active={isConnectedWalletconnect} />
            <span>Walletconnect</span>
          </MenuItem>
          {active && <MenuItem onClick={disconnect}>Disconnect</MenuItem>}
        </Menu>
      </MenuWrapper>
    </ClickAwayListener>
  )
}
