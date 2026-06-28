const { withNativeFederation, shareAll } = require('@angular-architects/native-federation/config');

module.exports = withNativeFederation({
  name: 'los',

  exposes: {
    './Component': './src/app/app.ts',
  },

  shared: {
    ...shareAll({ singleton: true, strictVersion: true, requiredVersion: 'auto' }),
  },

  skip: [
    'rxjs/ajax',
    'rxjs/fetch',
    'rxjs/testing',
    'rxjs/webSocket',
    'shared-auth',
    // Add further packages you don't need at runtime
  ],

  // Please read our FAQ about sharing libs:
  // https://shorturl.at/jmzH0

  features: {
    // ignoreUnusedDeps disabled: shared-auth is a local TypeScript source lib
    // (symlinked workspace package) that lives outside the app root.
    // Sheriff-core's filesystem traversal rejects out-of-root paths, so we
    // disable ignoreUnusedDeps and rely on the skip list instead.
    ignoreUnusedDeps: false,
  },
});
