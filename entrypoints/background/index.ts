import { TAB_PLUGIN_ACTIONS } from "~/entrypoints/common/constant/events";
import { BrowserMessageProps } from "~/entrypoints/types";
import { sendTabMessage, openEditorCodePage } from "~/entrypoints/common/tabs";
import utils from "../utils";

export default defineBackground(() => {

  // 左键点击图标 (如果有 popup 是不会触发的，可以执行 browser.action.setPopup({ popup: '' }) 来监听事件)
  browser.action.setPopup({ popup: "" });

  browser.action.onClicked.addListener(async (tab) => {
    await sendTabMessage({
      msgType: 'PluginStageChange',
      data: { tabId: tab.id },
    });
  });
});

// 监听content.js 发送的消息
browser.runtime.onMessage.addListener(async (msg, msgSender, sendResponse) => {
  console.log("browser.runtime.onMessage--background", msg, msgSender);
  const { msgType, data } = (msg || {}) as BrowserMessageProps;
  if (msgType === "openEditCodePage") {
    openEditorCodePage();
  }
});
