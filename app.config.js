// Dynamic Expo config: merges app.json (passed in as `config`) with
// environment-dependent values. Expo reads app.json first and hands it
// to this function, so nothing in app.json is lost.
//
// GOOGLE_MAPS_API_KEY must be set in the build environment (.env.local
// for local dev, EAS secrets / Woz dashboard for builds). Never commit it.
module.exports = ({ config }) => ({
  ...config,
  android: {
    ...config.android,
    config: {
      ...config.android?.config,
      googleMaps: {
        apiKey: process.env.GOOGLE_MAPS_API_KEY ?? '',
      },
    },
  },
});
