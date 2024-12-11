export default defineBackground(() => {
  browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    // 检查页面是否完成加载
    if (changeInfo.status === "complete") {
      await browser.tabs.sendMessage(tabId, {
        type: "JY_START_COPY_DOM",
        data: { timestamp: Date.now(), id: tabId },
      });
    }
  });

  // 左键点击图标 (如果有 popup 是不会触发的，可以执行 browser.action.setPopup({ popup: '' }) 来监听事件)
  browser.action.setPopup({ popup: "" });

  browser.action.onClicked.addListener(async (tab) => {
    if (tab.id) {
      await browser.tabs.sendMessage(tab.id, {
        type: "JY_COPY_DOM_CHANGE",
        data: { timestamp: Date.now(), id: tab.id },
      });
    }
  });
});
