/* global __TARGET__ */
import { Intents } from 'cozy-interapp'

let client

const lib =
  __TARGET__ === 'mobile' ? require('./mobile/mobile') : require('./web')

export const getClient = () => {
  if (client) {
    return client
  }

  client = lib.getClient()

  const intents = new Intents({ client })
  client.intents = intents

  // Used as a hack to prevent circular dependency.
  // Some selectors need to access cozyClient to correctly hydrate.
  // That should change, hydratation should be possible to do only
  // with the store
  // See selectors/index.js
  window.cozyClient = client

  return client
}

export { default as CleanupStoreClientPlugin } from './cleanup'
export { default as StartupChecksPlugin } from './checks'
