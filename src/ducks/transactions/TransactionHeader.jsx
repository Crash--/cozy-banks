import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { withRouter } from 'react-router'
import { flowRight as compose, max } from 'lodash'
import { translate, withBreakpoints } from 'cozy-ui/react'
import { withSize } from 'react-sizeme'
import cx from 'classnames'

import BackButton from 'components/BackButton'
import Breadcrumb from 'components/Breadcrumb'
import { ConnectedSelectDates } from 'components/SelectDates'
import { AccountSwitch } from 'ducks/account'
import TransactionSelectDates from 'ducks/transactions/TransactionSelectDates'
import flag from 'cozy-flags'
import HistoryChart from 'ducks/balance/HistoryChart'
import Header from 'components/Header'
import { Padded } from 'components/Spacing'

import TableHead from './header/TableHead'
import styles from './TransactionsPage.styl'

class TransactionHeader extends Component {
  static propTypes = {
    showBackButton: PropTypes.bool
  }

  isSubcategory = () => {
    const { router } = this.props

    return router.params.subcategoryName !== undefined
  }

  renderAccountSwitch = () => {
    const isSubcategory = this.isSubcategory()
    const theme = flag('transaction-history') ? 'primary' : 'default'
    const colorProps = {
      color: theme
    }

    return (
      <div className={styles.TransactionHeader__accountSwitchContainer}>
        {this.props.showBackButton && <BackButton theme={theme} arrow />}
        <AccountSwitch small={isSubcategory} {...colorProps} />
      </div>
    )
  }

  displaySelectDates = () => {
    const colorProps = {
      color: flag('transaction-history') ? 'primary' : 'default'
    }
    if (this.isSubcategory()) {
      return <ConnectedSelectDates showFullYear {...colorProps} />
    }

    const { transactions, handleChangeMonth, currentMonth } = this.props

    return (
      <TransactionSelectDates
        transactions={transactions}
        value={currentMonth}
        onChange={handleChangeMonth}
        {...colorProps}
        className="u-p-0"
      />
    )
  }

  displayBreadcrumb = () => {
    const { t, breakpoints, router } = this.props

    if (breakpoints.isMobile || !this.isSubcategory()) {
      return
    }

    const { categoryName, subcategoryName } = router.params
    const breadcrumbItems = [
      {
        name: t('Categories.title.general'),
        onClick: () => router.push('/categories')
      },
      {
        name: t(`Data.categories.${categoryName}`),
        onClick: () => router.push(`/categories/${categoryName}`)
      },
      {
        name: t(`Data.subcategories.${subcategoryName}`)
      }
    ]

    const withChart = flag('transaction-history')
    const colorProps = { color: withChart ? 'primary' : 'default' }

    return (
      <Breadcrumb
        items={breadcrumbItems}
        className={styles.TransactionPage__Breadcrumb}
        {...colorProps}
      />
    )
  }

  displayBalanceHistory() {
    const {
      chartData,
      size,
      breakpoints: { isMobile }
    } = this.props
    if (!flag('transaction-history') || !chartData || !size) {
      return
    }
    const intervalBetweenPoints = 2
    const marginBottom = isMobile ? 48 : 64
    const historyChartMargin = {
      top: 26,
      bottom: marginBottom,
      left: 0,
      right: isMobile ? 16 : 32
    }

    const height = isMobile ? 66 : 96

    return (
      <HistoryChart
        margin={historyChartMargin}
        data={chartData}
        height={height + marginBottom}
        width={max([size.width, intervalBetweenPoints * chartData.length])}
        className={styles.TransactionsHeader__chart}
      />
    )
  }

  render() {
    const {
      router,
      transactions,
      breakpoints: { isMobile }
    } = this.props
    const isSubcategory = !!router.params.subcategoryName
    const withChart = flag('transaction-history')
    const colorProps = { color: withChart ? 'primary' : 'default' }

    return (
      <Header {...colorProps} fixed>
        <Padded className={isMobile ? 'u-p-0' : 'u-pb-half'}>
          {this.renderAccountSwitch()}
        </Padded>
        {!isSubcategory && this.displayBalanceHistory()}
        <Padded
          className={cx(
            {
              'u-ph-half': isMobile,
              'u-pv-0': isMobile,
              'u-pb-half': isMobile
            },
            styles.TransactionsHeader__selectDatesContainer
          )}
        >
          {this.displaySelectDates()}
        </Padded>
        {isSubcategory && (
          <Padded className={isMobile ? 'u-p-0' : 'u-pt-0'}>
            {this.displayBreadcrumb()}
          </Padded>
        )}
        {transactions.length > 0 && (
          <TableHead isSubcategory={isSubcategory} {...colorProps} />
        )}
      </Header>
    )
  }
}

export default compose(
  withRouter,
  withBreakpoints(),
  withSize(),
  translate()
)(TransactionHeader)
