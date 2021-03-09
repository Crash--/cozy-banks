/* global __TARGET__ */

import React, { useMemo } from 'react'
import { Provider } from 'react-redux'

import I18n from 'cozy-ui/transpiled/react/I18n'
import MuiCozyTheme from 'cozy-ui/transpiled/react/MuiCozyTheme'
import { Sprite as IconSprite } from 'cozy-ui/transpiled/react/Icon'
import { CozyProvider } from 'cozy-client'
import { BreakpointsProvider } from 'cozy-ui/transpiled/react/hooks/useBreakpoints'

import flag from 'cozy-flags'

import { TrackerProvider } from 'ducks/tracking/browser'
import JobsProvider from 'components/JobsContext'
import Alerter from 'cozy-ui/transpiled/react/Alerter'
import { initTranslation } from 'cozy-ui/react/I18n'

const jobsProviderOptions = t => ({
  onSuccess: () => Alerter.success(t('JobsContext.alerter-success')),
  onError: () => Alerter.error(t('JobsContext.alerter-errored'))
})

const initT = (lang, dictRequire) => {
  const polyglot = initTranslation(lang, dictRequire)
  const t = polyglot.t.bind(polyglot)
  return { t }
}

const AppContainer = ({ store, lang, history, client }) => {
  const AppRoute = require('components/AppRoute').default
  const Router =
    __TARGET__ === 'mobile' || flag('authentication')
      ? require('ducks/mobile/MobileRouter').default
      : require('react-router').Router

  const dictRequire = lang => require(`locales/${lang}`)
  const { t } = useMemo(() => {
    return initT(lang, dictRequire)
  }, [lang])

  return (
    <BreakpointsProvider>
      <IconSprite />
      <TrackerProvider>
        <Provider store={store}>
          <CozyProvider client={client}>
            <I18n lang={lang} dictRequire={dictRequire}>
              <JobsProvider client={client} options={jobsProviderOptions(t)}>
                <MuiCozyTheme>
                  <Router history={history} routes={AppRoute()} />
                </MuiCozyTheme>
              </JobsProvider>
            </I18n>
          </CozyProvider>
        </Provider>
      </TrackerProvider>
    </BreakpointsProvider>
  )
}

export default AppContainer
