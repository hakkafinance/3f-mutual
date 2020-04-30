import { ethers } from 'ethers'
import BigNumber from 'bignumber.js'

export function calculateLeftUnits(expiringUnits = []) {
  const lefted = expiringUnits.map((x, i, arr) => {
    return arr.slice(i).reduce((s, y) => s.add(y), ethers.constants.Zero)
  })
  return [...lefted, ethers.constants.Zero]
}

export function calculateUnderlyingEth(shares = ethers.constants.Zero) {
  const c1 = new BigNumber('78125000')
  const c2 = new BigNumber('149999843750000')

  return c1
    .times(shares.pow(2))
    .plus(
      c2
        .times(shares)
        .shiftedBy(18)
        .div(2),
    )
    .shiftedBy(-36)
}
