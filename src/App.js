import React, { Suspense } from 'react'
import { BrowserRouter, Switch, Route } from 'react-router-dom'
import { SWRConfig } from 'swr'
import { Web3ReactProvider, createWeb3ReactRoot } from '@web3-react/core'
import { SnackbarProvider } from 'notistack'
import { ethers } from 'ethers'
// import Web3 from 'web3'

import InsuranceContextProvider, {
  Updater as InsuranceContextUpdater,
} from './contexts/insurance'
import ProfileContextProvider from './contexts/profile'
import ThreeBoxContextProvider from './contexts/3Box'
import Home from './pages/Home'
import Referral from './pages/Referral'
import Web3Manager from './components/Web3Manager'
import ThemeProvider, { GlobalStyle } from './themes'
import { READ_ONLY } from './constants'

const Web3ReadOnlyProvider = createWeb3ReactRoot(READ_ONLY)

function getLibrary(provider) {
  const library = new ethers.providers.Web3Provider(provider)
  library.pollingInterval = 10000
  return library
}

function ContextProviders({ children }) {
  return (
    <InsuranceContextProvider>
      <ProfileContextProvider>
        <ThreeBoxContextProvider>
          {children}
        </ThreeBoxContextProvider>
      </ProfileContextProvider>
    </InsuranceContextProvider>
  )
}

function Updaters() {
  return (
    <>
      <InsuranceContextUpdater />
    </>
  )
}

function Router() {
  return (
    <Suspense fallback={null}>
      <BrowserRouter>
        <Switch>
          <Route exact path='/'>
            <Home />
          </Route>
          <Route path='/:slug'>
            <Referral />
          </Route>
        </Switch>
      </BrowserRouter>
    </Suspense>
  )
}

function App() {
  return (
    <SWRConfig
      value={{
        refreshInterval: 15000,
        fetcher: (...args) => fetch(...args).then(res => res.json())
      }}
    >
      <Web3ReactProvider getLibrary={getLibrary}>
        <Web3ReadOnlyProvider getLibrary={getLibrary}>
          <Web3Manager>
            <ContextProviders>
              <Updaters />
              <ThemeProvider>
                <GlobalStyle />
                <SnackbarProvider
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                >
                  <Router />
                </SnackbarProvider>
              </ThemeProvider>
            </ContextProviders>
          </Web3Manager>
        </Web3ReadOnlyProvider>
      </Web3ReactProvider>
    </SWRConfig>
  )
}

export default App
