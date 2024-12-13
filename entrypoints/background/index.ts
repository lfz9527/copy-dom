import { TAB_PLUGIN_ACTIONS } from "~/entrypoints/common/constant/events";
import { BrowserMessageProps } from "~/entrypoints/types";
import { sendTabMessage, openEditorCodePage} from "~/entrypoints/common/tabs";
import utils from "../utils";

const TabPluginState: Record<
  string,
  {
    load: boolean;
    inject: boolean;
  }
> = {};

export default defineBackground(() => {
  browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    utils.doLog("tab加载");
    if (!TabPluginState[tabId]) {
      TabPluginState[tabId] = {
        load: false,
        inject: false,
      };
    }

    TabPluginState[tabId]["load"] = true;
    TabPluginState[tabId]["inject"] = false;
  });

  browser.tabs.onActivated.addListener(async (activeInfo) => {
    utils.doLog("tab激活");
    const {tabId} = activeInfo;
    if(!activeInfo.tabId) return;

    // 当激活时，关闭所有tab的插件生成的dom
    if(!TabPluginState[tabId]?.inject) {
      await sendTabMessage({
        msgType: TAB_PLUGIN_ACTIONS.ON_DESTROYED,
        data: { tabId: tabId },
      });
    }
  });

  // 左键点击图标 (如果有 popup 是不会触发的，可以执行 browser.action.setPopup({ popup: '' }) 来监听事件)
  browser.action.setPopup({ popup: "" });

  browser.action.onClicked.addListener(async (tab) => {
    if (!tab.id) return;
    const { load, inject } = TabPluginState[tab.id];
    if (load) {
      await sendTabMessage({
        msgType: inject
          ? TAB_PLUGIN_ACTIONS.ON_DESTROYED
          : TAB_PLUGIN_ACTIONS.ON_CREATED,
        data: { tabId: tab.id },
      });
      TabPluginState[tab.id].inject = !inject;
    }

    // 当点击时，关闭所有tab的插件生成的dom
    if (inject) {
      Object.keys(TabPluginState).forEach((key) => {
        TabPluginState[key].inject = false;
      });
    }
  });
});

// 监听content.js 发送的消息
browser.runtime.onMessage.addListener(async (msg, msgSender, sendResponse) => {
  console.log('browser.runtime.onMessage--background', msg, msgSender);
  const { msgType, data } = (msg || {}) as BrowserMessageProps;
  if (msgType === 'openEditCodePage') {
    openEditorCodePage()
  }
});
