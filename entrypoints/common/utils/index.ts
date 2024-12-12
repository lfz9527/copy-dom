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
const openFullHtmlNewTab = (fullHtml: string, isReturn = false) => {
  // 创建Blob并打开新窗口
  const blob = new Blob([fullHtml], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  if (isReturn) return url;

  window.open(url, "_blank");

  // 清理URL对象
  setTimeout(() => URL.revokeObjectURL(url), 0);
};

function downloadBlob(fullHtml: string) {
  const url = openFullHtmlNewTab(fullHtml, true);
  const link = document.createElement("a");
  link.href = url!;
  link.download = "index.html";

  // 触发点击
  link.click();

  // 清理 URL 对象
  url && URL.revokeObjectURL(url);
}

// 定义分类结果的类型
interface ClassifiedProps {
  common: string[]; // 共同属性
  different: string[]; // 不同属性
  unique: {
    obj1: string[]; // obj1 独有的属性
    obj2: string[]; // obj2 独有的属性
  };
}

// 分类方法：比较两个对象的属性
const classifyProps = (
  obj1: Record<string, string>,
  obj2: Record<string, string>
): ClassifiedProps => {
  const common: string[] = []; // 存放共同属性
  const different: string[] = []; // 存放不同属性
  const unique: { obj1: string[]; obj2: string[] } = { obj1: [], obj2: [] }; // 存放独有属性

  // 获取对象1和对象2的所有属性
  const obj1Keys = Object.keys(obj1);
  const obj2Keys = Object.keys(obj2);

  // 处理obj1的属性
  obj1Keys.forEach((key) => {
    if (obj2.hasOwnProperty(key)) {
      // 如果obj2也有该属性，判断属性值是否相同
      if (obj1[key] === obj2[key]) {
        common.push(key); // 如果值相同，添加到共同属性
      } else {
        different.push(key); // 如果值不同，添加到不同属性
      }
    } else {
      unique.obj1.push(key); // 如果obj2没有该属性，添加到obj1的独有属性
    }
  });

  // 处理obj2的属性（避免遗漏 obj2 中有而 obj1 中没有的属性）
  obj2Keys.forEach((key) => {
    if (!obj1.hasOwnProperty(key)) {
      unique.obj2.push(key); // 如果obj1没有该属性，添加到obj2的独有属性
    }
  });

  return {
    common,
    different,
    unique,
  };
};

// 对象转化为url参数
const objectToUrlParams = (params: Record<string, any>): string => {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value && value !== "") {
      searchParams.append(key, value);
    }
  }
  return searchParams.toString();
};


/**
 * @description: 生成随机字符串
 * @param digit 想要生成的随机字符串长度
 * @param isPlainNumber 随机字符串是否纯数字
 * @return 要输出的字符串
 */
const getRandomId = (digit: number = 8, isPlainNumber: boolean = false) => {
  return 'x'.repeat(digit).replace(/[x]/g, (c) => {
    const radix = isPlainNumber ? 10 : 16;
    return ((Math.random() * radix) | 0).toString(radix);
  });
}


export {
  doLog,
  getElPosition,
  openFullHtmlNewTab,
  downloadBlob,
  classifyProps,
  objectToUrlParams,
  getRandomId
};
