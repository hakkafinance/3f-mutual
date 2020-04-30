import { AbstractConnector } from '@web3-react/abstract-connector'
import { ethers } from 'ethers'
import invariant from 'tiny-invariant'

import PrivateKeyProvider from './PrivateKeyProvider'

export default class NetworkWithSignerConnector extends AbstractConnector {
  constructor({
    privateKey,
    urls,
    defaultChainId,
    pollingInterval,
    requestTimeoutMs,
  }) {
    invariant(
      defaultChainId || Object.keys(urls).length === 1,
      'defaultChainId is a required argument with >1 url',
    )
    super({ supportedChainIds: Object.keys(urls).map(k => Number(k)) })

    this.providers = Object.keys(urls).reduce((accumulator, chainId) => {
      const provider = new PrivateKeyProvider(privateKey, urls[Number(chainId)])
      return Object.assign(accumulator, { [Number(chainId)]: provider })
    }, {})
    this.currentChainId = defaultChainId || Number(Object.keys(urls)[0])
    this.pollingInterval = pollingInterval
    this.requestTimeoutMs = requestTimeoutMs
    this.active = false
    this.wallet = new ethers.Wallet(privateKey)
  }

  async activate() {
    if (!this.wallet) {
      throw Error('Please create a wallet first.')
    }
    const provider = this.providers[this.currentChainId]
    provider.engine.start()
    this.active = true
    return {
      provider: provider,
      chainId: this.currentChainId,
      account: this.wallet.address,
    }
  }

  async getProvider() {
    return this.providers[this.currentChainId]
  }

  async getChainId() {
    return this.currentChainId
  }

  async getAccount() {
    return this.wallet.address
  }

  deactivate() {
    this.providers[this.currentChainId].engine.stop()
    this.active = false
  }

  changeChainId(chainId) {
    invariant(
      Object.keys(this.providers).includes(chainId.toString()),
      `No url found for chainId ${chainId}`,
    )
    if (this.active) {
      this.providers[this.currentChainId].engine.stop()
      this.currentChainId = chainId
      this.providers[this.currentChainId].engine.start()
      this.emitUpdate({
        provider: this.providers[this.currentChainId],
        chainId,
      })
    } else {
      this.currentChainId = chainId
    }
  }
}
