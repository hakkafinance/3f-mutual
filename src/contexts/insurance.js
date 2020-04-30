import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
  useEffect,
  useState,
} from 'react'
import { useWeb3React } from '@web3-react/core'
import { safeAccess, getContract, isAddress } from '../utils'
import { READ_ONLY, INSURANCE_ADDRESSES } from '../constants'
import INSURANCE_ABI from '../constants/abis/insurance.json'
import { constants } from 'ethers'

const SYSTEM = 'SYSTEM'
const USER = 'USER'

// action types
const UPDATE_SYSTEM = 'UPDATE_SYSTEM'
const UPDATE_USER = 'UPDATE_USER'

const InsuranceContext = createContext()

export function useInsuranceContext() {
  return useContext(InsuranceContext)
}

function reducer(state, { type, payload }) {
  switch (type) {
    case UPDATE_SYSTEM: {
      const {
        chainId,
        pot,
        totalShares,
        totalInsurances,
        totalAgents,
        sharePrice,
        ended,
        expiringUnits,
        blockNumber,
      } = payload

      return {
        ...state,
        [SYSTEM]: {
          ...(safeAccess(state, [SYSTEM]) || {}),
          [chainId]: {
            pot,
            totalShares,
            totalInsurances,
            totalAgents,
            sharePrice,
            ended,
            expiringUnits,
            blockNumber,
          },
        },
      }
    }
    case UPDATE_USER: {
      const {
        chainId,
        account,
        shares,
        insurances,
        lastBought,
        dividends,
        bonus,
        expiringUnits,
        blockNumber,
      } = payload

      return {
        ...state,
        [USER]: {
          ...(safeAccess(state, [USER]) || {}),
          [chainId]: {
            ...(safeAccess(state, [USER, chainId]) || {}),
            [account]: {
              shares,
              insurances,
              lastBought,
              dividends,
              bonus,
              expiringUnits,
              blockNumber,
            },
          },
        },
      }
    }
    default: {
      throw Error(`Unexpected action type in Insurance context: ${type}`)
    }
  }
}

export default function Provider({ children }) {
  const [refreshCount, setRefreshCount] = useState(0)
  const refresh = useCallback(() => setRefreshCount(refreshCount + 1), [
    refreshCount,
  ])

  const [state, dispatch] = useReducer(reducer, {})

  const updateSystem = useCallback(
    (
      chainId,
      pot,
      totalShares,
      totalInsurances,
      totalAgents,
      sharePrice,
      ended,
      expiringUnits,
      blockNumber,
    ) => {
      dispatch({
        type: UPDATE_SYSTEM,
        payload: {
          chainId,
          pot,
          totalShares,
          totalInsurances,
          totalAgents,
          sharePrice,
          ended,
          expiringUnits,
          blockNumber,
        },
      })
    },
    [],
  )

  const updateUser = useCallback(
    (
      chainId,
      account,
      shares,
      insurances,
      lastBought,
      dividends,
      bonus,
      expiringUnits,
      blockNumber,
    ) =>
      dispatch({
        type: UPDATE_USER,
        payload: {
          chainId,
          account,
          shares,
          insurances,
          lastBought,
          dividends,
          bonus,
          expiringUnits,
          blockNumber,
        },
      }),
    [],
  )

  const value = useMemo(
    () => [state, { updateSystem, updateUser, refresh }, refreshCount],
    [refresh, refreshCount, state, updateSystem, updateUser],
  )

  return (
    <InsuranceContext.Provider value={value}>
      {children}
    </InsuranceContext.Provider>
  )
}

export function Updater() {
  const { chainId, library } = useWeb3React(READ_ONLY)
  const { account } = useWeb3React()
  const [
    state,
    { updateSystem, updateUser },
    refreshCount,
  ] = useInsuranceContext()

  const { blockNumber: systemBlockNumber } =
    safeAccess(state, [SYSTEM, chainId]) || {}

  const { blockNumber: userBlockNumber } =
    safeAccess(state, [USER, chainId, account]) || {}

  // initialize system metrics
  useEffect(() => {
    if (
      (systemBlockNumber && userBlockNumber
        ? systemBlockNumber < userBlockNumber
        : true) &&
      (chainId || chainId === 0) &&
      library
    ) {
      let stale = false
      const contract = getContract(
        INSURANCE_ADDRESSES[chainId],
        INSURANCE_ABI,
        library,
      )
      async function checkIsClaimable() {
        try {
          await contract.callStatic.claim()
          return true
        } catch {
          return false
        }
      }
      Promise.all([
        contract.pool(),
        contract.shares(),
        contract.issuedInsurance(),
        contract.agents(),
        contract.getBuyPrice(),
        checkIsClaimable(),
        contract.getExpiringUnitList(),
        library.getBlockNumber(),
      ])
        .then(
          ([
            pot,
            shares,
            insurances,
            agents,
            price,
            ended,
            expiringUnitList,
            blockNumber,
          ]) => {
            if (!stale) {
              updateSystem(
                chainId,
                pot,
                shares,
                insurances,
                agents,
                price,
                ended,
                expiringUnitList,
                blockNumber,
              )
            }
          },
        )
        .catch(() => {
          if (!stale) {
            updateSystem(
              chainId,
              null,
              null,
              null,
              null,
              null,
              null,
              null,
              userBlockNumber,
            )
          }
        })

      return () => {
        stale = true
      }
    }
  }, [
    chainId,
    library,
    systemBlockNumber,
    updateSystem,
    userBlockNumber,
    refreshCount,
  ])

  // get user metrics
  useEffect(() => {
    if (isAddress(account) && (chainId || chainId === 0) && library) {
      let stale = false
      const contract = getContract(
        INSURANCE_ADDRESSES[chainId],
        INSURANCE_ABI,
        library,
      )
      Promise.all([
        contract.player(account),
        contract.getCurrentUnit(account),
        contract.mask(),
        contract.getExpiringUnitListPlayer(account),
        library.getBlockNumber(),
      ])
        .then(([player, insurances, mask, expiringUnitList, blockNumber]) => {
          const dividends = player.shares.isZero()
            ? constants.Zero
            : mask
                .mul(player.shares)
                .div(constants.WeiPerEther)
                .sub(player.mask)
          const lastBought = player.plyrLastSeen.mul(86400000)
          if (!stale) {
            updateUser(
              chainId,
              account,
              player.shares,
              insurances,
              lastBought,
              dividends,
              player.ref,
              expiringUnitList,
              blockNumber,
            )
          }
        })
        .catch(() => {
          if (!stale) {
            updateUser(
              chainId,
              account,
              null,
              null,
              null,
              null,
              null,
              null,
              systemBlockNumber,
            )
          }
        })

      return () => {
        stale = true
      }
    }
  }, [account, chainId, library, systemBlockNumber, updateUser, refreshCount])

  return null
}

export function useInsuranceSystem() {
  const { chainId } = useWeb3React(READ_ONLY)
  const [state] = useInsuranceContext()
  const {
    pot,
    totalShares,
    totalInsurances,
    totalAgents,
    sharePrice,
    ended,
    expiringUnits,
  } = safeAccess(state, [SYSTEM, chainId]) || {}

  return {
    pot,
    totalShares,
    totalInsurances,
    totalAgents,
    sharePrice,
    ended,
    expiringUnits,
  }
}

export function useInsuranceUser() {
  const { chainId } = useWeb3React(READ_ONLY)
  const { account } = useWeb3React()
  const [state] = useInsuranceContext()
  const { shares, insurances, lastBought, dividends, bonus, expiringUnits } =
    safeAccess(state, [USER, chainId, account]) || {}

  return {
    shares,
    insurances,
    lastBought,
    dividends,
    bonus,
    expiringUnits,
  }
}
