import { objectToUrlParams, getRandomId } from "./utils/index";
// 向tab 发送消息
export async function sendTabMessage({
  msgType,
  data,
}: {
  msgType: string;
  data: Record<string, any>;
}) {
  const { tabId } = data;
  console.log("sendTabMessage", tabId);
  if (!tabId) return;
  await browser.tabs.sendMessage(tabId, {
    type: msgType,
    data,
  });
}

export async function getEditCodeTabInfo() {
  const editCodePageUrl = browser.runtime.getURL("/options.html");
  const [tab] = await browser.tabs.query({
    url: `${editCodePageUrl}*`,
    currentWindow: true,
  });

  return { tab, editCodePageUrl };
}

// 打开编辑器代码页
export const openEditorCodePage = async (query?: Record<string, string>) => {
  const paramsStr = objectToUrlParams(
    Object.assign(query || {}, { randomId: getRandomId(6) })
  );
  const { tab, editCodePageUrl } = await getEditCodeTabInfo();

  const urlWithParams = `${editCodePageUrl}#${paramsStr ?? ""}`;

  if (tab?.id) {
    await browser.tabs.move(tab.id, { index: 0 });
    await browser.tabs.update(tab.id, {
      highlighted: true,
      pinned: false,
      url: urlWithParams,
    });
    // browser.tabs.reload(tab.id); // 这个方法会清空路由参数，切记
  } else {
    await browser.tabs.create({
      index: 0,
      url: urlWithParams,
      pinned: false,
    });
  }
};

export default { sendTabMessage };
