import React, { memo, Fragment } from 'react'
import PropTypes from 'prop-types'
import { flowRight as compose } from 'lodash'
import { withStyles } from '@material-ui/core/styles'
import LinearProgress from '@material-ui/core/LinearProgress'
import { translate } from 'cozy-ui/react'

import { Figure } from 'components/Figure'
import Header from 'components/Header'
import { Padded } from 'components/Spacing'
import VerticalBox from 'components/VerticalBox'
import BalancePanels from 'ducks/balance/BalancePanels'
import BarTheme from 'ducks/mobile/BarTheme'

import headerTitleStyles from 'ducks/balance/components/HeaderTitle.styl'
import styles from 'ducks/balance/components/AccountsImporting.styl'

const muiStyles = () => ({
  linearColorPrimary: {
    backgroundColor: 'var(--primaryColorLight)',
    borderRadius: '2px'
  },
  linearBarColorPrimary: {
    backgroundColor: 'white'
  }
})

const createGroups = (types, konnectorSlugs) => {
  const accounts = konnectorSlugs.map(konnectorSlug => ({
    _id: konnectorSlug,
    loading: true
  }))

  return types.map(type => ({
    _id: type,
    virtual: true,
    loading: true,
    label: type,
    accounts: {
      data: accounts
    }
  }))
}

const createPanelsState = types => {
  const panelsState = {}
  types.forEach(type => {
    panelsState[type] = {
      expanded: true,
      accounts: {
        fake1: { checked: true },
        fake2: { checked: true }
      }
    }
  })

  return panelsState
}

const AccountsImporting = ({ t, classes, konnectorSlugs }) => {
  const types = ['Checkings', 'Savings']

  const groups = createGroups(types, konnectorSlugs)
  const panelsState = createPanelsState(types)

  return (
    <Fragment>
      <BarTheme theme="primary" />
      <Header className={styles.content} color="primary">
        <VerticalBox center className={styles.header}>
          <Padded>
            <Figure
              className={headerTitleStyles.HeaderTitle_balance}
              currencyClassName={
                headerTitleStyles.BalanceHeader__currentBalanceCurrency
              }
              total={0}
              symbol="€"
            />
            <LinearProgress
              className={styles.progress}
              classes={{
                colorPrimary: classes.linearColorPrimary,
                barColorPrimary: classes.linearBarColorPrimary
              }}
            />
            <div className={styles.text}>{t('Balance.importing_accounts')}</div>
            <div className={styles.text}>{t('Balance.delay')}</div>
          </Padded>
        </VerticalBox>
      </Header>
      <Padded className="u-pt-0">
        <BalancePanels
          groups={groups}
          panelsState={panelsState}
          warningLimit={0}
          withBalance={false}
        />
      </Padded>
    </Fragment>
  )
}

AccountsImporting.propTypes = {
  t: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired,
  konnectorSlugs: PropTypes.arrayOf(PropTypes.string)
}

export default compose(
  withStyles(muiStyles),
  translate(),
  memo
)(AccountsImporting)
