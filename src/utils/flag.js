/* global __DEV__ */

import flag from 'cozy-flags'
import { some } from 'lodash'

/** Reset flags, keeping only those set to true */
const garbageCollectFlags = () => {
  const trueFlags = flag
    .list()
    .map(name => [name, flag(name)])
    .filter(x => x[1])
    .map(x => x[0])
  flag.reset()
  for (const trueFlag of trueFlags) {
    flag(trueFlag, true)
  }
}

garbageCollectFlags()

if (__DEV__ && flag('switcher') === null) {
  flag('switcher', true)
}

const demoFqdns = [
  'stephaniedurand.cozy.rocks',
  'isabelledurand.cozy.rocks',
  'genevievedurand.cozy.rocks',
  'isabelledurand.mycozy.cloud'
]

const locationMatchesFqdn = (location, fqdn) => {
  const splitted = fqdn.split('.')
  const slug = splitted[0]
  const domain = splitted.slice(1).join('.')
  const rx = new RegExp(slug + '.*' + domain.replace('.', '\\.'))
  return rx.exec(location)
}

const isDemoCozy = () => {
  const location = window.location.href
  return some(demoFqdns.map(fqdn => locationMatchesFqdn(location, fqdn)))
}

if (isDemoCozy()) {
  flag('demo', true)
}

// Turn on error banner on transactions page

// Turn on loan details page

// Turn on all flags related to owners

window.flag = flag
