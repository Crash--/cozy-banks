import React, { Component } from 'react'
import { translate, Button, Icon } from 'cozy-ui/react'
import styles from 'styles/groupes'
import Table from 'components/Table'
import { ACCOUNT_DOCTYPE, GROUP_DOCTYPE } from 'doctypes'
import { cozyConnect, fetchCollection } from 'redux-cozy-client'
import Loading from 'components/Loading'
import plus from 'assets/icons/16/plus.svg'
import { withRouter } from 'react-router'

const isPending = (reduxObj) => {
  return reduxObj.fetchStatus === 'pending'
}

const GroupList = withRouter(translate()(({groups, accounts, t, router}) => {
  return groups.length ? <Table className={styles.Groups__table}>
    <thead>
      <tr>
        <th className={styles['bnk-table-libelle']}>
          {t('Groups.label')}
        </th>
        <th className={styles['bnk-table-comptes']}>
          {t('Groups.accounts')}
        </th>
      </tr>
    </thead>

    <tbody>
      {groups.map(group => (
        <tr onClick={() => router.push(`/settings/groups/${group._id}`)} className={styles.Accounts__row}>
          <td className={styles['bnk-table-libelle']}>
            {group.label}
          </td>
          <td className={styles['bnk-table-comptes']}>
            {group.accounts
              .map(accountId =>
                accounts.data.find(account => (account._id === accountId))
              ).filter(account => account)
               .map(account => account.label)
               .join(', ')}
          </td>
        </tr>
      ))}
    </tbody>
  </Table> : <p>
    {t('Groups.no-groups')}
  </p>
}))

const Groups = withRouter(class extends Component {
  render ({ t, groups, accounts, router }, { editingGroup }) {
    if (isPending(groups) || isPending(accounts)) {
      return <Loading />
    }
    return (
      <div>
        {groups.fetchStatus === 'loading'
          ? <Loading />
          : <GroupList accounts={accounts} groups={groups.data.filter(x => x)} />}

        <p>
          <Button theme='regular' onClick={() => router.push('/settings/groups/new')}>
            <Icon icon={plus} /> {t('Groups.create')}
          </Button>
        </p>
      </div>
    )
  }
})

export default cozyConnect(ownProps => {
  return {
    accounts: fetchCollection('accounts', ACCOUNT_DOCTYPE),
    groups: fetchCollection('groups', GROUP_DOCTYPE)
  }
})(translate()(Groups))
