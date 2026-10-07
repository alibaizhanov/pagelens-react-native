// PageLens for React Native / Expo — https://pagelens.io/docs/install/react-native
// Nothing is stored on the device: users are counted on the server with a hash that rotates daily.
const { Platform, Dimensions } = require('react-native');
const { createClient } = require('./core');

function detectEnv() {
  const ios = Platform.OS === 'ios';
  const s = Dimensions.get('screen');
  const tablet = ios ? !!Platform.isPad : Math.min(s.width, s.height) >= 600;
  const osVersion = String(Platform.Version);
  let language = 'en';
  try { language = Intl.DateTimeFormat().resolvedOptions().locale || 'en'; } catch (e) {}
  return {
    platform: ios ? 'ios' : 'android',
    os: ios ? (Platform.isPad ? 'iPadOS' : 'iOS') : 'Android',
    osVersion,
    device: tablet ? 'tablet' : 'mobile',
    appVersion: '1.0',
    appId: 'app',
    screen: `${Math.round(s.width)}x${Math.round(s.height)}`,
    language,
    // Stable per device and app version; the server mixes it with the IP and a daily salt
    userAgent: `Mozilla/5.0 (${ios ? (Platform.isPad ? 'iPad' : 'iPhone') : 'Linux; Android'} ${osVersion}) PageLensRN/1.0`,
  };
}

const client = createClient(detectEnv());

/**
 * React Navigation: pass to <NavigationContainer onStateChange={trackNavigation} /> (and onReady)
 * to send a screen view whenever the focused route changes.
 */
let lastRoute = null;
function trackNavigation(state) {
  let route = state && state.routes && state.routes[state.index];
  while (route && route.state && route.state.routes) route = route.state.routes[route.state.index];
  if (route && route.name !== lastRoute) {
    lastRoute = route.name;
    client.screen(route.name);
  }
}

module.exports = {
  configure: client.configure,
  screen: client.screen,
  track: client.track,
  trackError: client.trackError,
  identify: client.identify,
  setEnabled: client.setEnabled,
  flush: client.flush,
  trackNavigation,
};
