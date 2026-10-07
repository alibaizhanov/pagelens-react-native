# PageLens for React Native

Privacy-friendly analytics for React Native and Expo apps — the SDK for [PageLens](https://pagelens.io).

- **Nothing is stored on the device** and no advertising identifier is used — users are counted on the server with a hash that rotates daily. No tracking prompt needed.
- Pure JavaScript, no native modules: works in Expo Go, bare React Native, iOS and Android.
- Screens, custom events, errors and signed-in users in the same dashboard as your website.

## Install

```sh
npm install github:alibaizhanov/pagelens-react-native
```

## Use

Add your app in PageLens (*Add Site → Mobile app*) to get a site id, then:

```js
import * as PageLens from 'pagelens-react-native';
import * as Application from 'expo-application'; // optional: shows your app version

PageLens.configure({
  siteId: 'YOUR_SITE_ID',
  appVersion: Application.nativeApplicationVersion,
  appId: Application.applicationId,
});

// React Navigation: one screen view per route change
<NavigationContainer
  ref={navigationRef}
  onReady={() => PageLens.trackNavigation(navigationRef.getRootState())}
  onStateChange={PageLens.trackNavigation}
>

PageLens.screen('Settings');                       // without React Navigation
PageLens.track('signup', { plan: 'pro' });         // any action
PageLens.identify(user.id);                        // optional, after sign-in
PageLens.trackError(error);                        // handled errors → Errors page
```

Screens appear as pages (`/Home`, `/Settings`), the app version under *Browsers*, and iOS / Android under *Operating systems*.

**App Store / Google Play:** no App Tracking Transparency prompt is needed. Declare analytics (product interaction) in the App Store privacy details and the Play Data safety form.

## License

MIT
