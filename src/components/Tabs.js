import React, { useCallback } from 'react'
import styled from 'styled-components'

const TabsWrapper = styled.nav`
  position: sticky;
  top: 4rem;
  z-index: 10;
  width: 100vw;
  height: 4rem;
  background-color: ${({ theme }) => theme.colors.tabsBackground};
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
  display: flex;
  overflow: auto;
  white-space: nowrap;

  ${({ theme }) => theme.mediaQuery.sm`
    justify-content: center;
  `}
`

const TabList = styled.div`
  height: 100%;
  display: flex;
`

const Tab = styled.button.attrs(() => ({ type: 'button' }))`
  position: relative;
  padding: 0 1.25rem;
  border: 0;
  border-bottom: 0.25rem solid;
  border-color: ${({ theme, active }) =>
    active ? theme.colors.indicator : 'transparent'};
  background-color: transparent;
  color: ${({ theme }) => theme.colors.white};
  font-size: 1.25rem;
  font-weight: ${({ active }) => (active ? 600 : 400)};
  font-family: 'Lora', serif;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;

  &:focus {
    outline: none;
  }

  &::after {
    content: '';
    position: absolute;
    top: 1rem;
    right: 0.75rem;
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
    background-color: ${({ theme }) => theme.colors.error};
    display: ${({ badge }) => badge ? 'block' : 'none'};
  }
`

export default function Tabs(props) {
  const { items = [], value = 0, onChange = () => {} } = props

  const handleTabClick = useCallback(
    tabIndex => () => {
      onChange(tabIndex)
    },
    [onChange],
  )

  const renderTabList = () => {
    return items.map((item, index) => {
      const text = item.text || item
      const number = item.index || index
      const badge = item.badge || false
      return (
        <Tab
          key={`${text}${number}`}
          active={index === value}
          badge={badge}
          onClick={handleTabClick(number)}
        >
          {text}
        </Tab>
      )
    })
  }

  return (
    <TabsWrapper>
      <TabList>{renderTabList()}</TabList>
    </TabsWrapper>
  )
}
