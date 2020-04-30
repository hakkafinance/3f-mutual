import React from 'react'
import {
  ThemeProvider as StyledComponentsThemeProvider,
  css,
} from 'styled-components'

export { GlobalStyle } from './GlobalStyle'

const breakpoints = {
  xs: 0,
  sm: 600,
  md: 960,
  lg: 1280,
  xl: 1920,
}

const mediaQuery = Object.keys(breakpoints).reduce((accumulator, label) => {
  accumulator[label] = (...args) => css`
    @media (min-width: ${breakpoints[label]}px) {
      ${css(...args)}
    }
  `
  return accumulator
}, {})

const black = '#000000'
const white = '#FFFFFF'

const theme = {
  mediaQuery,
  fontFamilies: {},
  colors: {
    black,
    white,
    gray: '#D8D8D8',
    primary: '#17a2b8',
    success: '#81c784',
    error: '#e33371',
    textColor: '#231536',
    backgroundColor: white,
    headerBackground: '#74ADBB',
    buttonBackground: '#14A0DE',
    buttonText: white,
    tabsBackground: '#74ADBB',
    indicator: '#CAF4FF',
    divider: 'rgba(0, 0, 0, 0.2)',
  },
}

export default function ThemeProvider({ children }) {
  return (
    <StyledComponentsThemeProvider theme={theme}>
      {children}
    </StyledComponentsThemeProvider>
  )
}
