import { defineConfig } from "wxt";
import svgr from "vite-plugin-svgr";
// See https://wxt.dev/api/config.html
export default defineConfig({
  extensionApi: "chrome",
  modules: ["@wxt-dev/module-react"],
  vite: () => ({
    plugins: [svgr({ svgrOptions: { icon: true } })],
  }),
  manifest: {
    version: "1.0.0",
    name: "copyDom",
    permissions: [
      "activeTab",
      "storage",
      "contextMenus",
      "clipboardRead",
      "unlimitedStorage",
      "tabGroups",
      "tabs",
    ],
    action: {
      default_title: "Click Me",
    },
  },
});
