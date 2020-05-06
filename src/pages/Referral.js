import React, { useState, useEffect } from 'react'
import { useRouteMatch, Redirect } from 'react-router-dom'
import { useWeb3React } from '@web3-react/core'
import { READ_ONLY } from '../constants'

export default function Referral() {
  const { params } = useRouteMatch()
  const { slug } = params || {}

  const { chainId, library } = useWeb3React(READ_ONLY)

  const [isFinished, setIsFinish] = useState(false)
  useEffect(() => {
    if ((chainId || chainId === 0) && library && slug) {
      let stale = false
      let agentType
      if (slug.match(/^\d+$/)) {
        agentType = 'id'
      } else if (slug.match(/^0[xX][0-9a-fA-F]{40}$/)) {
        agentType = 'address'
      } else if (slug.match(/^[0-9a-zA-Z ]{1,32}$/)) {
        agentType = 'name'
      }
      localStorage.setItem('agentType', agentType)
      localStorage.setItem('agentSlug', slug)
      setTimeout(() => {
        if (!stale) {
          setIsFinish(true)
        }
      })

      return () => {
        stale = true
      }
    }
  }, [chainId, library, slug])

  if (isFinished) {
    return <Redirect to='/' />
  } else {
    return null
  }
}
