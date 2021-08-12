import { Nuchain, WsProvider, Keyring } from 'nuchain-api'
import { cryptoWaitReady } from '@polkadot/util-crypto'
import {
  web3Accounts,
  web3Enable,
  web3FromAddress,
} from '@polkadot/extension-dapp'

const keyring = new Keyring({ type: 'sr25519', ss58Format: 42 })

export default async ({ app }, inject) => {
  await cryptoWaitReady()

  console.log(`connecting to ${process.env.nuchainEndpoint}...`)

  const provider = new WsProvider(process.env.nuchainEndpoint)
  const conn = await Nuchain.connectApi({ provider })

  console.log('connected')

  var allAccounts = []

  async function init() {
    const allInjected = await web3Enable(process.env.appTitle)
    console.log(allInjected)
    allAccounts = await web3Accounts()
  }

  async function useAccount(address) {
    return await web3FromAddress(address)
  }

  inject('nuchain', {
    api: conn,
    init,
    getInjectedAccounts() {
      return allAccounts
    },
    useAccount,
    keyring,
    getError(events) {
      // get error by iterating triggered tx events
      var event = events.find(
        ({ event: { method, section } }) =>
          `${section}.${method}` == 'system.ExtrinsicFailed'
      )

      if (event && event.event) {
        event = event.event
      }

      if (!event || !event.data) {
        return null
      }

      const mod = event.data.find((a) => a.isModule)
      if (mod) {
        const error = mod.registry.findMetaError(mod.asModule)
        console.log(error)
        return error
      } else {
        return null
      }
    },
    getEventByName(events, name) {
      const event = events.find(
        ({ event: { method, section } }) => `${section}.${method}` == name
      )
      return event
    },
    async getCertificate(certId) {
      return cached(
        `cert-${certId}`,
        conn.query.certificate.certificates,
        certId
      )
    },
    async getIssuedCertificate(issuedId) {
      return await cached(
        `issued-cert-${issuedId}`,
        conn.query.certificate.issuedCert,
        issuedId
      )
    },
  })
}

async function cached(cacheKey, func, params) {
  let cache = $nuxt.$storage.getUniversal(cacheKey)
  const now = new Date().getTime()
  if (cache && cache.expired > now) {
    console.log(`[${cacheKey}] cache hit`)
    return cache.data
  }
  let result = await func(params)
  let expired = new Date()
  expired.setMinutes(expired.getMinutes() + 5)
  $nuxt.$storage.setUniversal(cacheKey, { expired, data: result })
  return result
}
