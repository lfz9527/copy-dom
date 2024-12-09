function doLog(logString: string) {
  console.log("=========插件日志: " + logString + "=========");
}

const getElPosition = (el: any) => {
  // 获取元素的尺寸和位置信息
  const { width, height, top, left } =
    (el as HTMLElement)?.getBoundingClientRect() || {};

  return {
    width,
    height,
    top: top + window.scrollY,
    left: left,
  };
};

// 打开完整html 在新的窗口
const openFullHtmlNewTab = (fullHtml: string) => {
  // 创建Blob并打开新窗口
  const blob = new Blob([fullHtml], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");

  // 清理URL对象
  setTimeout(() => URL.revokeObjectURL(url), 0);
};

export { doLog, getElPosition, openFullHtmlNewTab };
