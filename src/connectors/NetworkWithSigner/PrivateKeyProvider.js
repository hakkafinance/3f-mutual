import ProviderEngine from 'web3-provider-engine'
import FiltersSubprovider from 'web3-provider-engine/subproviders/filters'
import WalletSubprovider from 'web3-provider-engine/subproviders/wallet'
import RpcSubprovider from 'web3-provider-engine/subproviders/rpc'
import EthereumjsWallet from 'ethereumjs-wallet'
import NonceSubprovider from 'web3-provider-engine/subproviders/nonce-tracker'

function PrivateKeyProvider(privateKey, providerUrl) {
  if (!privateKey) {
    throw new Error(
      `Private Key missing, non-empty string expected, got '${privateKey}'`,
    )
  }

  if (!providerUrl) {
    throw new Error(
      `Provider URL missing, non-empty string expected, got '${providerUrl}'`,
    )
  }

  this.wallet = EthereumjsWallet.fromPrivateKey(
    new Buffer(privateKey.replace('0x', ''), 'hex'),
  )
  this.address = '0x' + this.wallet.getAddress().toString('hex')
  this.engine = new ProviderEngine()

  this.engine.addProvider(new FiltersSubprovider())
  this.engine.addProvider(new NonceSubprovider())
  this.engine.addProvider(new WalletSubprovider(this.wallet, {}))
  this.engine.addProvider(new RpcSubprovider({ rpcUrl: providerUrl }))
}

PrivateKeyProvider.prototype.sendAsync = function() {
  this.engine.sendAsync.apply(this.engine, arguments)
}

PrivateKeyProvider.prototype.send = function() {
  return this.engine.send.apply(this.engine, arguments)
}

export default PrivateKeyProvider
