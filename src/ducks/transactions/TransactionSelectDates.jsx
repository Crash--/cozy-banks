import React, { useState, useEffect, useMemo } from 'react'
import { useSelector } from 'react-redux'
import SelectDates, { monthRange } from 'components/SelectDates'
import last from 'lodash/last'
import uniq from 'lodash/uniq'
import {
  subMonths,
  format,
  parse,
  differenceInCalendarMonths,
  isAfter
} from 'date-fns'
import { useQuery, useClient } from 'cozy-client'
import { getDate } from 'ducks/transactions/helpers'
import { getFilteringDoc } from 'ducks/filters'
import {
  groupsConn,
  accountsConn,
  makeFilteredTransactionsConn
} from 'doctypes'

const rangeMonth = (startDate, endDate) => {
  const options = []

  for (let i = 0; i < differenceInCalendarMonths(endDate, startDate) + 1; i++) {
    options.push(subMonths(endDate, i))
  }

  return options
}

const getYearMonth = transaction => getDate(transaction).slice(0, 7)

export const getOptions = transactions => {
  const availableMonths = uniq(transactions.map(getYearMonth)).sort()

  const mAvailableMonths = new Set(availableMonths)

  const start = parse(availableMonths[0], 'YYYY-MM')
  const lastMonth = parse(last(availableMonths), 'YYYY-MM')
  const today = new Date()
  const end = isAfter(lastMonth, today) ? lastMonth : today

  return rangeMonth(start, end).map(month => {
    const fmted = format(month, 'YYYY-MM')
    return {
      yearMonth: fmted,
      disabled: !mAvailableMonths.has(fmted)
    }
  })
}

const useConn = conn => {
  return useQuery(conn.query, conn)
}

const useTransactionExtent = () => {
  const client = useClient()
  const accounts = useConn(accountsConn)
  const groups = useConn(groupsConn)
  const filteringDoc = useSelector(getFilteringDoc)
  const transactionsConn = makeFilteredTransactionsConn({
    filteringDoc,
    accounts,
    groups
  })
  const [data, setData] = useState([])

  useEffect(() => {
    const fetch = async () => {
      const q = transactionsConn.query()
      const latestQuery = q.limitBy(1)
      const earliestQuery = q
        .sortBy([{ account: 'asc' }, { date: 'asc' }])
        .limitBy(1)
      const [earliest, latest] = await Promise.all(
        [earliestQuery, latestQuery].map((q, i) =>
          client.query(q, {
            as: `${transactionsConn.as}-${i === 0 ? 'earliest' : 'latest'}`,
            autoUpdate: false
          })
        )
      )
      setData([earliest.data[0], latest.data[0]])
    }

    if (transactionsConn.enabled) {
      fetch()
    }
  }, [transactionsConn.enabled]) // eslint-disable-line

  return data
}

const TransactionSelectDates = props => {
  const [earliestTransaction, latestTransaction] = useTransactionExtent()
  const options = useMemo(() => {
    if (!earliestTransaction || !latestTransaction) {
      return []
    }
    const { date: earliestDate } = earliestTransaction
    const { date: latestDate } = latestTransaction
    return monthRange(new Date(earliestDate), new Date(latestDate))
      .map(date => ({
        yearMonth: format(date, 'YYYY-MM'),
        disabled: false
      }))
      .reverse()
  }, [earliestTransaction, latestTransaction])
  return (
    <>
      <SelectDates options={options} {...props} />
    </>
  )
}

export default React.memo(TransactionSelectDates)
