import { createSelector } from 'reselect'
import { buildAutoGroups, isAutoGroup } from 'ducks/groups/helpers'
import { buildVirtualAccounts } from 'ducks/account/helpers'

let client
const getClient = () => {
  if (!client) {
    client = window.cozyClient
  }
  return client
}

// We need the client here since selectors that are directly exported
// from cozy-client cannot hydrate. We should find a better way to do
// that :
//  - Be able to hydrate without a client.
//  - Put the schema inside the store.
//  - The problem is that some methods used by relationships are bound
//    to the client
const querySelector = (queryName, options) => () => {
  const client = getClient()
  return client.getQueryFromState(queryName, options)
}

export const queryDataSelector = (queryName, options) =>
  createSelector(
    [querySelector(queryName, options)],
    query => (query && query.data) || []
  )

export const getTransactionsRaw = queryDataSelector('transactions', {
  hydrated: true
})
export const getGroups = queryDataSelector('groups')
export const getAccounts = queryDataSelector('accounts')
export const getApps = queryDataSelector('apps')

export const getTransactions = createSelector(
  [getTransactionsRaw],
  transactions => transactions.filter(Boolean)
)

export const getVirtualAccounts = createSelector(
  [getTransactions],
  transactions => buildVirtualAccounts(transactions)
)

export const getAllAccounts = createSelector(
  [getAccounts, getVirtualAccounts],
  (accounts, virtualAccounts) => [...accounts, ...virtualAccounts]
)

export const getAutoGroups = createSelector(
  [getGroups],
  groups => groups.filter(isAutoGroup)
)

const isHealthReimbursementVirtualAccount = account =>
  account._id === 'health_reimbursements'

export const getVirtualGroups = createSelector(
  [getAllAccounts, getAutoGroups],
  (accounts, autoGroups) => {
    // While autogroups service has not run, we display virtual groups
    // to the user
    if (autoGroups.length === 0) {
      return buildAutoGroups(accounts, { virtual: true })
    } else {
      return buildAutoGroups(
        accounts.filter(isHealthReimbursementVirtualAccount),
        { virtual: true }
      )
    }
  }
)

export const getAllGroups = createSelector(
  [getGroups, getVirtualGroups],
  (groups, virtualGroups) => [...groups, ...virtualGroups]
)

export const getAppUrlById = createSelector(
  [getApps],
  (apps, id) => {
    if (apps && apps.length > 0) {
      for (const app of apps) {
        if (app._id === id) {
          return app.links.related
        }
      }
    }
    return
  }
)
