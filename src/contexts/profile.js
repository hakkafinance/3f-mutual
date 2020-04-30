import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
  useEffect,
} from 'react'
import { useWeb3React } from '@web3-react/core'
import { ethers } from 'ethers'
import { safeAccess, isAddress, getContract } from '../utils'
import { READ_ONLY, INSURANCE_ADDRESSES } from '../constants'
import INSURANCE_ABI from '../constants/abis/insurance.json'

const ProfileContext = createContext()

export function useProfileContext() {
  return useContext(ProfileContext)
}

const UPDATE = 'UPDATE'

function reducer(state, { type, payload }) {
  switch (type) {
    case UPDATE: {
      const { chainId, account, id, name, level, points, pointsMax } = payload

      return {
        ...state,
        [chainId]: {
          ...(safeAccess(state, [chainId]) || {}),
          [account]: {
            ...(safeAccess(state, [chainId, account]) || {}),
            id,
            name,
            level,
            points,
            pointsMax,
          },
        },
      }
    }
    default: {
      throw Error(`Unexpected action type in ProfileContext: ${type}`)
    }
  }
}

export default function Provider({ children }) {
  const [state, dispatch] = useReducer(reducer, {})
  const update = useCallback(
    (chainId, account, id, name, level, points, pointsMax) =>
      dispatch({
        type: UPDATE,
        payload: {
          chainId,
          account,
          id,
          name,
          level,
          points,
          pointsMax,
        },
      }),
    [],
  )
  const value = useMemo(() => [state, { update }], [state, update])

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  )
}

export function useProfile(account) {
  const { chainId, library } = useWeb3React(READ_ONLY)
  const [state, { update }] = useProfileContext()
  const { id, name, level, points, pointsMax } =
    safeAccess(state, [chainId, account]) || {}

  const updateProfile = useCallback(async () => {
    if (isAddress(account) && (chainId || chainId === 0) && library) {
      const contract = getContract(
        INSURANCE_ADDRESSES[chainId],
        INSURANCE_ABI,
        library,
      )
      const player = await contract.player(account)
      const requirement = await contract.requirement(player.level)
      update(
        chainId,
        account,
        player.id,
        ethers.utils.parseBytes32String(player.name),
        player.level,
        player.accumulatedRef,
        requirement,
      )
    }
  }, [account, chainId, library, update])

  useEffect(() => {
    updateProfile()
  }, [updateProfile])

  return {
    account,
    id,
    name,
    level,
    points,
    pointsMax,
    refresh: updateProfile,
  }
}
