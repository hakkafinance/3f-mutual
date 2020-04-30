import React, { createContext, useContext, useReducer, useCallback, useMemo, useEffect } from 'react'
import { useWeb3React } from '@web3-react/core'

const ACTIVATE = 'ACTIVATE'
const INITIALIZE = 'INITIALIZE'

const ThreeBoxContext = createContext()

export function useThreeBoxContext() {
  return useContext(ThreeBoxContext)
}

const INITIAL_STATE = {
  active: false,
  isLoggedIn: false,
  box: null,
  address: null,
  profile: null
}

function reducer(state, { type, payload }) {
  switch (type) {
    case ACTIVATE: {
      const { address, profile, box } = payload
      return {
        ...state,
        address,
        profile,
        box,
        active: true,
        isLoggedIn: true,
      }
    }
    case INITIALIZE: {
      const { profile, isLoggedIn } = payload
      return {
        ...state,
        profile,
        isLoggedIn,
      }
    }
    default: {
      throw Error(`Unexpected action type in ThreeBoxContext: ${type}`)
    }
  }
}

export default function Provider({ children }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE)

  const { active: web3Active, account } = useWeb3React()

  const activate = useCallback(async () => {
    if (web3Active) {
      const box = await window.Box.openBox(account, window.ethereum, {})
      const profile = await window.Box.getProfile(account)
      await box.syncDone
      dispatch({ type: ACTIVATE, payload: { box, account, profile }})
    }
  }, [account, web3Active])
  
  // get profile first
  useEffect(() => {
    if (account) {
      let stale = false
      Promise.all([
        window.Box.isLoggedIn(account),
        window.Box.getProfile(account)
      ]).then(([isLoggedIn, profile]) => {
          if (!stale) {
            dispatch({ type: INITIALIZE, payload: { isLoggedIn, profile }})
          }
        })
        .catch(() => {
          if (!stale) {
            dispatch({ type: INITIALIZE, payload: { isLoggedIn: false, profile: null }})
          }
        })
      
      return () => {
        stale = true
      }
    }
  }, [account])

  const value = useMemo(() => ({ ...state, activate}), [activate, state])

  return <ThreeBoxContext.Provider value={value}>{children}</ThreeBoxContext.Provider>
}
