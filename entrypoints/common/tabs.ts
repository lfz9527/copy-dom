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

// 打开编辑器代码页
export const openEditorCodePage = async (query?: Record<string, string>) => {
  const paramsStr = objectToUrlParams(
    Object.assign(query || {}, { randomId: getRandomId(6) })
  );
  let editCodePageUrl = browser.runtime.getURL("/options.html");

  const urlWithParams = `${editCodePageUrl}#${paramsStr ?? ""}`;

  await browser.tabs.create({
    index: 0,
    url: urlWithParams,
    pinned: true,
  });
};

export default { sendTabMessage };
