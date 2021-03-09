import React from 'react'
import { I18n } from 'cozy-ui/transpiled/react'
import { CozyProvider } from 'cozy-client'
import { Provider } from 'react-redux'
import langEn from 'locales/en.json'
import store from 'test/store'
import getClient from 'test/client'
import { BreakpointsProvider } from 'cozy-ui/transpiled/react/hooks/useBreakpoints'
import RouterContext from 'components/RouterContext'
import { TrackerProvider } from 'ducks/tracking/browser'
import { JobsContext } from '../src/components/JobsContext'

export const TestI18n = ({ children }) => {
  return (
    <I18n lang={'en'} dictRequire={() => langEn}>
      {children}
    </I18n>
  )
}

const AppLike = ({ children, store, client, router, jobsInProgress }) => {
  return (
    <TrackerProvider>
      <RouterContext.Provider value={router}>
        <BreakpointsProvider>
          <Provider store={(client && client.store) || store}>
            <CozyProvider client={client || getClient()}>
              <JobsContext.Provider value={{ jobsInProgress }}>
                <TestI18n>{children}</TestI18n>
              </JobsContext.Provider>
            </CozyProvider>
          </Provider>
        </BreakpointsProvider>
      </RouterContext.Provider>
    </TrackerProvider>
  )
}

AppLike.defaultProps = {
  store
}

export default AppLike
