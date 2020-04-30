import React, { useState, useEffect } from 'react'
import { useRouteMatch, Redirect } from 'react-router-dom'
import { useWeb3React } from '@web3-react/core'
import { ethers } from 'ethers'
import { getContract } from '../utils'
import { INSURANCE_ADDRESSES, READ_ONLY } from '../constants'
import INSURANCE_ABI from '../constants/abis/insurance.json'

export default function Referral() {
  const { params } = useRouteMatch()
  const { slug } = params || {}

  const { chainId, library } = useWeb3React(READ_ONLY)

  const [isFinished, setIsFinish] = useState(false)
  useEffect(() => {
    let stale = false
    async function getAgentInfo() {
      if ((chainId || chainId === 0) && library && slug) {
        const contract = getContract(
          INSURANCE_ADDRESSES[chainId],
          INSURANCE_ABI,
          library,
        )
        let address
        if (slug.match(/^\d+$/)) {
          const id = parseInt(slug)
          address = await contract.agentxID_(id)
        } else if (slug.match(/^0[xX][0-9a-fA-F]{40}$/)) {
          address = slug
        } else if (slug.match(/^[0-9a-zA-Z ]{1,32}$/)) {
          const name = ethers.utils.formatBytes32String(slug)
          address = await contract.agentxName_(name)
        }
        localStorage.setItem('agentAddress', address)
        setTimeout(() => {
          if (!stale) {
            setIsFinish(true)
          }
        }, 300)
      }
    }
    getAgentInfo()

    return () => {
      stale = true
    }
  }, [chainId, library, slug])

  if (isFinished) {
    return <Redirect to='/' />
  } else {
    return null
  }
}
