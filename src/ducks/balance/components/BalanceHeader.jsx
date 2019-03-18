import React, { memo } from 'react'
import { flowRight as compose } from 'lodash'
import { translate, withBreakpoints } from 'cozy-ui/react'

import { Padded } from 'components/Spacing'
import Header from 'components/Header'
import { Figure } from 'components/Figure'
import { PageTitle } from 'components/Title'
import KonnectorUpdateInfo from 'components/KonnectorUpdateInfo'
import History from 'ducks/balance/History'
import { filterByAccounts } from 'ducks/filters'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'

import styles from './BalanceHeader.styl'

const BalanceHeader = ({
  t,
  breakpoints: { isMobile },
  accountsBalance,
  accounts,
  subtitleParams,
  filterByAccounts,
  router
}) => {
  const titlePaddedClass = isMobile ? 'u-p-0' : 'u-pb-0'
  const titleColor = isMobile ? 'primary' : 'default'
  return (
    <Header className={styles.BalanceHeader} color="primary">
      {isMobile && (
        <Padded className={titlePaddedClass}>
          <PageTitle color={titleColor}>{t('Balance.title')}</PageTitle>
        </Padded>
      )}
      {accountsBalance !== undefined && (
        <Figure
          onClick={() => {
            filterByAccounts(accounts)
            router.push('/balances/details')
          }}
          className={styles.BalanceHeader__currentBalance}
          currencyClassName={styles.BalanceHeader__currentBalanceCurrency}
          total={accountsBalance}
          symbol="€"
        />
      )}
      <div className={styles.BalanceHeader__subtitle}>
        {subtitleParams
          ? t('BalanceHistory.checked_accounts', subtitleParams)
          : t('BalanceHistory.all_accounts')}
      </div>
      {accounts && <History accounts={accounts} />}
      <KonnectorUpdateInfo />
    </Header>
  )
}

const actionCreators = {
  filterByAccounts
}

export const DumbBalanceHeader = BalanceHeader

export default compose(
  connect(
    null,
    actionCreators
  ),
  withBreakpoints(),
  withRouter,
  translate(),
  memo
)(BalanceHeader)
