// Platform-independent client: builds events and sends them one at a time, in order.
// The server timestamps events on arrival, so sending in order keeps screens and actions in sequence.

function createClient(env, fetchImpl) {
  let siteId = null;
  let endpoint = null;
  let enabled = true;
  let currentScreen = '/';
  let queue = Promise.resolve();
  let lastStatus = null;
  const doFetch = fetchImpl || ((...a) => fetch(...a));

  const appUrl = (screen) => {
    const clean = screen.startsWith('/') ? screen : `/${screen}`;
    return `app://${env.appId}${encodeURI(clean)}`;
  };

  function send(type, { name, screen, props, extra } = {}) {
    if (screen) currentScreen = screen;
    if (!enabled) return queue;
    if (!siteId) {
      if (typeof console !== 'undefined') console.warn('[PageLens] call configure({ siteId }) first');
      return queue;
    }
    const payload = {
      site_id: siteId,
      type,
      url: appUrl(currentScreen),
      title: currentScreen,
      platform: env.platform,
      os: env.os,
      os_version: env.osVersion,
      device: env.device,
      app_version: env.appVersion,
      screen: env.screen,
      language: env.language,
      ...(name ? { name: String(name).slice(0, 200) } : {}),
      ...(props && typeof props === 'object' ? { props } : {}),
      ...(extra || {}),
    };
    const body = JSON.stringify(payload);
    const url = endpoint;
    queue = queue.then(() => doFetch(url, { method: 'POST', headers: { 'Content-Type': 'text/plain', 'User-Agent': env.userAgent }, body })
      .then((r) => { lastStatus = r.status; })
      .catch(() => {}));
    return queue;
  }

  return {
    configure({ siteId: id, host = 'https://app.pagelens.io', appVersion, appId } = {}) {
      siteId = id;
      endpoint = `${String(host).replace(/\/+$/, '')}/api/track`;
      if (appVersion) env.appVersion = String(appVersion);
      if (appId) env.appId = String(appId);
    },
    screen: (name, props) => send('pageview', { screen: String(name), props }),
    track: (event, props) => send('custom_event', { name: event, props }),
    trackError: (error, props) => send('error', { name: error && error.message ? error.message : String(error), props }),
    identify: (userId, traits) => send('identify', { extra: { user_id: userId == null ? null : String(userId), ...(traits ? { traits } : {}) } }),
    setEnabled: (value) => { enabled = !!value; },
    flush: () => queue,
    get lastStatus() { return lastStatus; },
    _appUrl: appUrl,
  };
}

module.exports = { createClient };
