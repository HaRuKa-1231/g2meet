import { defineConfig } from 'wxt';

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  webExt: {
    disabled: true,
  },
  zip: {
    artifactTemplate: '{{name}}-{{version}}-chrome.zip',
    sourcesTemplate: '{{name}}-{{version}}-sources.zip',
  },
  manifest: {
    version: '1.0.0',
    default_locale: 'en',
    name: '__MSG_app_name__',
    description: '__MSG_app_description__',
    action: {
      default_title: '__MSG_action_title__',
    },
    permissions: ['tabs', 'storage', 'scripting', 'alarms'],
    host_permissions: ['https://app.gather.town/*', 'https://meet.google.com/*'],
  },
});
