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
    await browser.tabs.remove(tab.id);
  }
  await browser.tabs.create({
    index: 0,
    url: urlWithParams,
    pinned: false,
  });
};

export default { sendTabMessage };
