import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  extensionApi: 'chrome',
  modules: ['@wxt-dev/module-react'],
  manifest:{
    version: '1.0.0',
    name:'copyDom',
    permissions: ['activeTab'],
    action:{
      default_title: 'Click Me'
    }
  }
});
