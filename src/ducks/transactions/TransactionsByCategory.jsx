import React, { Component } from 'react'
import { withRouter } from 'react-router'
import { connect } from 'react-redux'
import { translate } from 'cozy-ui/react/I18n'
import { FigureBlock } from 'components/Figure'
import Loading from 'components/Loading'
import { Topbar } from 'ducks/commons'
import { SelectDates, getFilteredTransactions } from 'ducks/filters'
import { fetchTransactions } from 'actions'
import { getUrlBySource, findApps } from 'ducks/apps'
import { flowRight as compose } from 'lodash'
import { cozyConnect } from 'cozy-client'
import { getCategoryId, getParentCategory } from 'ducks/categories/categoriesMap'
import { Breadcrumb } from 'components/Breadcrumb'

import TransactionsWithSelection from './TransactionsWithSelection'
import styles from './TransactionsPage.styl'

const isPendingOrLoading = function (col) {
  return col.fetchStatus === 'pending' || col.fetchStatus === 'loading'
}

class TransactionsByCategory extends Component {
  async componentDidMount () {
    this.props.fetchApps()
  }

  render () {
    const { t, urls, transactions, router } = this.props
    let { filteredTransactions } = this.props

    // filter by category
    const selectedCategory = router.params.categoryName
    const categoryId = getCategoryId(selectedCategory)
    filteredTransactions = filteredTransactions.filter(transaction => transaction.categoryId === categoryId)

    if (isPendingOrLoading(transactions)) {
      return <Loading loadingType='movements' />
    }

    let credits = 0
    let debits = 0
    filteredTransactions.forEach((transaction) => {
      if (transaction.amount > 0) {
        credits += transaction.amount
      } else {
        debits += transaction.amount
      }
    })
    const parentCategory = getParentCategory(getCategoryId(selectedCategory))
    const breadcrumbItems = [
      {
        name: t('Categories.title.general'),
        onClick: () => router.push('/categories')
      },
      {
        name: t(`Data.categories.${parentCategory}`),
        onClick: () => router.push(`/categories/${parentCategory}`)
      },
      {
        name: t(`Data.subcategories.${selectedCategory}`)
      }
    ]
    return (
      <div className={styles['bnk-mov-page']}>
        <Topbar>
          <Breadcrumb items={breadcrumbItems} tag='h2' />
        </Topbar>
        <SelectDates />
        {filteredTransactions.length !== 0 && <div className={styles['bnk-mov-figures']}>
          <FigureBlock label={t('Transactions.total')} total={credits + debits} currency='€' coloredPositive coloredNegative signed />
          <FigureBlock label={t('Transactions.transactions')} total={filteredTransactions.length} decimalNumbers={0} />
          <FigureBlock label={t('Transactions.debit')} total={debits} currency='€' signed />
          <FigureBlock label={t('Transactions.credit')} total={credits} currency='€' signed />
        </div>}
        {filteredTransactions.length === 0
          ? <p>{t('Transactions.no-movements')}</p>
          : <TransactionsWithSelection transactions={filteredTransactions} urls={urls} />}
      </div>
    )
  }
}

const mapStateToProps = state => ({
  urls: {
    // this keys are used on Transactions.jsx to:
    // - find transaction label
    // - display appName in translate `Transactions.actions.app`
    MAIF: getUrlBySource(state, 'gitlab.cozycloud.cc/labs/cozy-maif'),
    HEALTH: getUrlBySource(state, 'gitlab.cozycloud.cc/labs/cozy-sante'),
    EDF: getUrlBySource(state, 'gitlab.cozycloud.cc/labs/cozy-edf')
  },
  filteredTransactions: getFilteredTransactions(state)
})

const mapDispatchToProps = dispatch => ({
  fetchApps: () => dispatch(findApps()),
  dispatch
})

const mapDocumentsToProps = ownProps => ({
  transactions: fetchTransactions(ownProps.dispatch)
})

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps),
  cozyConnect(mapDocumentsToProps),
  translate()
)(TransactionsByCategory)
