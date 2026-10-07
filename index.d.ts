type Props = Record<string, string | number | boolean | null>;

/** Call once at startup. `appVersion` (e.g. from expo-application or react-native-device-info) shows under Browsers. */
export function configure(options: { siteId: string; host?: string; appVersion?: string; appId?: string }): void;
/** A screen view — the app equivalent of a pageview. */
export function screen(name: string, properties?: Props): Promise<void>;
/** A custom event such as "signup". Don't send personal data. */
export function track(event: string, properties?: Props): Promise<void>;
/** A handled error, shown on the Errors page. */
export function trackError(error: unknown, properties?: Props): Promise<void>;
/** Link this session to your own user id. Pass null after sign-out. */
export function identify(userId: string | null, traits?: Props): Promise<void>;
/** Pause or resume sending (e.g. for users who opt out). */
export function setEnabled(enabled: boolean): void;
/** Resolves when every queued event has been sent. */
export function flush(): Promise<void>;
/** React Navigation: `<NavigationContainer onStateChange={trackNavigation}>` sends a screen view on every route change. */
export function trackNavigation(state: unknown): void;
