const { composePlugins, withNx } = require('@nx/webpack');

// Alternative modern approach using composePlugins
module.exports = composePlugins(withNx(), (config, { options, context }) => {
  // Add watch options for better development experience
  config.watchOptions = {
    ignored: /node_modules/,
    poll: 1000, // Check for changes every second
    aggregateTimeout: 300, // Delay rebuild after first change
  };

  return config;
});
