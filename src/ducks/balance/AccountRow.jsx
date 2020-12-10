import React, { useCallback } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import CozyClient, { queryConnect } from 'cozy-client'
import cx from 'classnames'
import compose from 'lodash/flowRight'
import { withStyles } from '@material-ui/core/styles'

import Icon from 'cozy-ui/transpiled/react/Icon'
import Switch from 'cozy-ui/transpiled/react/MuiCozyTheme/Switch'
import Figure from 'cozy-ui/transpiled/react/Figure'
import { useI18n } from 'cozy-ui/transpiled/react/I18n'
import useBreakpoints from 'cozy-ui/transpiled/react/hooks/useBreakpoints'
import Typography from 'cozy-ui/transpiled/react/Typography'
import ListItem from 'cozy-ui/transpiled/react/MuiCozyTheme/ListItem'
import ListItemIcon from 'cozy-ui/transpiled/react/MuiCozyTheme/ListItemIcon'
import ListItemText from 'cozy-ui/transpiled/react/ListItemText'

import {
  getAccountLabel,
  getAccountInstitutionLabel,
  getAccountBalance,
  isReimbursementsAccount
} from 'ducks/account/helpers'
import { getWarningLimitPerAccount } from 'selectors'
import styles from 'ducks/balance/AccountRow.styl'
import ReimbursementsIcon from 'ducks/balance/ReimbursementsIcon'
import AccountIcon from 'components/AccountIcon'
import { triggersConn } from 'doctypes'
import { Contact } from 'cozy-doctypes'
import AccountCaption from 'ducks/balance/AccountRowCaption'

const Owners = React.memo(function Owners(props) {
  const { owners } = props

  return (
    <>
      <Icon
        icon={owners.length > 1 ? 'team' : 'people'}
        size={10}
        className={styles.AccountRow__ownersIcon}
      />
      {owners.map(Contact.getDisplayName).join(' - ')}
    </>
  )
})

const AccountRowIcon = ({ account }) => {
  return isReimbursementsAccount(account) ? (
    <ReimbursementsIcon account={account} />
  ) : (
    <AccountIcon account={account} />
  )
}

const ListItemTextColumn = withStyles({
  root: {
    flexBasis: '100%',
    paddingRight: '1rem'
  }
})(ListItemText)

const PrimaryColumn = withStyles({
  root: {
    flexBasis: '200%' // Primary column is twice as large as other columns
  }
})(ListItemTextColumn)

const ActionListItemTextColumn = withStyles({
  root: {
    justifyContent: 'right',
    display: 'flex',
    alignItems: 'center',
    marginRight: '-0.5rem',
    paddingRight: 0
  }
})(ListItemTextColumn)

const secondaryColumnPrimaryTypographyProps = {
  color: 'textSecondary',
  variant: 'body2'
}
const SecondaryColumn = props => {
  return (
    <ListItemTextColumn
      primaryTypographyProps={secondaryColumnPrimaryTypographyProps}
      {...props}
    />
  )
}

const EllipseTypography = withStyles({
  root: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  }
})(Typography)

const AccountRow = props => {
  const {
    account,
    onClick,
    hasWarning,
    checked,
    disabled,
    onSwitchChange,
    id,
    triggersCol
  } = props

  const { t } = useI18n()
  const { isMobile } = useBreakpoints()
  const owners = account.owners.data.filter(Boolean).filter(owner => !owner.me)
  const hasOwners = owners.length > 0
  const hasAlert = account.balance < 0
  const accountLabel = getAccountLabel(account)
  const handleSwitchClick = useCallback(ev => {
    ev.stopPropagation()
  }, [])

  return (
    <ListItem
      button
      disableRipple
      classes={{
        root: cx({
          [styles['AccountRow--hasWarning']]: hasWarning,
          [styles['AccountRow--hasAlert']]: hasAlert,
          [styles['AccountRow--disabled']]:
            (!checked || disabled) && account.loading !== true
        })
      }}
      onClick={onClick}
    >
      <ListItemIcon>
        <AccountRowIcon account={account} />
      </ListItemIcon>
      <PrimaryColumn disableTypography>
        <EllipseTypography
          variant="body1"
          color={disabled ? 'secondaryTextColor' : 'primaryTextColor'}
        >
          {account.virtual ? t(accountLabel) : accountLabel}
        </EllipseTypography>
        <AccountCaption
          gutterBottom={isMobile && hasOwners}
          triggersCol={triggersCol}
          account={account}
        />
        {isMobile && hasOwners ? (
          <Typography variant="caption" color="textSecondary">
            <Owners owners={owners} />
          </Typography>
        ) : null}
      </PrimaryColumn>
      {!isMobile && hasOwners ? (
        <SecondaryColumn>
          <Owners variant="body2" owners={owners} />
        </SecondaryColumn>
      ) : null}
      {!isMobile ? (
        <SecondaryColumn>
          {account.number ? `N°${account.number}` : null}
        </SecondaryColumn>
      ) : null}
      {!isMobile ? (
        <SecondaryColumn>{getAccountInstitutionLabel(account)}</SecondaryColumn>
      ) : null}
      <ActionListItemTextColumn disableTypography>
        <Figure
          symbol="€"
          total={getAccountBalance(account)}
          className={cx(styles.AccountRow__figure)}
          totalClassName={styles.AccountRow__figure}
          currencyClassName={styles.AccountRow__figure}
        />
        {/* color: Do not deactivate interactions with the button,
          only color it to look disabled */}
        <Switch
          disableRipple
          checked={checked}
          color={disabled ? 'default' : 'primary'}
          onClick={handleSwitchClick}
          id={id}
          onChange={onSwitchChange}
        />
      </ActionListItemTextColumn>
    </ListItem>
  )
}

AccountRow.propTypes = {
  account: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired,
  hasWarning: PropTypes.bool.isRequired,
  checked: PropTypes.bool.isRequired,
  disabled: PropTypes.bool.isRequired,
  onSwitchChange: PropTypes.func.isRequired,
  id: PropTypes.string.isRequired
}

export default compose(
  queryConnect({
    triggersCol: {
      ...triggersConn,
      fetchPolicy: CozyClient.fetchPolicies.noFetch
    }
  }),
  connect((state, { account }) => {
    const warningLimits = getWarningLimitPerAccount(state)
    const accountLimit = warningLimits[account._id]
    return {
      hasWarning: accountLimit ? accountLimit > account.balance : false
    }
  }),
  React.memo
)(AccountRow)
