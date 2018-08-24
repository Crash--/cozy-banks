/* global __TARGET__ */
import { Intents } from 'cozy-interapp'

let client

const lib = __TARGET__ === 'mobile' ? require('./mobile') : require('./web')

export const getClient = state => {
  if (client) {
    return client
  }

  client = lib.getClient(state)

  const intents = new Intents({ client })
  client.intents = intents

  return client
}
