/* global __TARGET__, __APP_VERSION__ */
import React from 'react'
import {
  translate,
  Tabs,
  TabPanels,
  TabPanel,
  TabList,
  Tab
} from 'cozy-ui/react'
import styles from './Settings.styl'
import { withRouter } from 'react-router'
import { flowRight as compose } from 'lodash'
import AppVersion from './AppVersion'
import { PageTitle } from 'components/Title'
import { Padded } from 'components/Spacing'

const tabNames = ['configuration', 'accounts', 'groups']

const Settings = ({ t, children, router }) => {
  let defaultTab = router.location.pathname.replace('/settings/', '')
  if (tabNames.indexOf(defaultTab) === -1) defaultTab = 'configuration'

  const goTo = url => () => {
    router.push(url)
  }

  const tabs = tabNames.map(tabName => (
    <Tab key={tabName} name={tabName} onClick={goTo(`/settings/${tabName}`)}>
      {t(`Settings.${tabName}`)}
    </Tab>
  ))

  return (
    <Padded>
      <PageTitle className={styles.settings__title}>
        {t('Settings.title')}
      </PageTitle>
      <Tabs className={styles['bnk-tabs']} initialActiveTab={defaultTab}>
        <TabList className={styles['bnk-coz-tab-list']}>{tabs}</TabList>
        <TabPanels className={styles.TabPanels}>
          <TabPanel active>{children}</TabPanel>
        </TabPanels>
      </Tabs>
      {__TARGET__ === 'mobile' && <AppVersion version={__APP_VERSION__} />}
    </Padded>
  )
}

export default compose(
  withRouter,
  translate()
)(Settings)
