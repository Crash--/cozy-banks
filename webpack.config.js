'use strict'

const merge = require('webpack-merge')
const {
  target,
  hotReload,
  analyze
} = require('./config/webpack.vars')

module.exports = (env = {}) => {
  env.target = env.target || 'browser' 

  const common = merge(
    require('./config/webpack.config.base'),
    require('./config/webpack.config.disable-contexts'),
    require('./config/webpack.config.styles'),
    require('./config/webpack.config.cozy-ui'),
    require('./config/webpack.config.pictures'),
    require('./config/webpack.config.vendors'),
    require('./config/webpack.config.manifest'),
    require('./config/webpack.config.piwik'),
    require('./config/webpack.config.string-replace'),
    env.hot ? require(`./config/webpack.config.hot-reload`) : null,
    analyze ? require(`./config/webpack.config.analyze`) : null
  )

  const targetCfg = require(`./config/webpack.target.${env.target}`)(env)

  const withTarget = merge.strategy({
    'resolve.extensions': 'prepend'
  })(common, targetCfg)

  const modeConfig = production
    ? require('./config/webpack.config.prod')(env)
    : require('./config/webpack.config.dev')(env)

  return merge(withTarget, modeConfig)
}

if (require.main === module) {
  console.log(module.exports)
}
