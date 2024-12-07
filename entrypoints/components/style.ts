// 样式白名单
const STYLE_WHITELIST = [
  // 布局相关
  "display",
  "position",
  "top",
  "right",
  "bottom",
  "left",
  "float",
  "clear",
  "z-index",

  // 盒模型
  "width",
  "height",
  "max-width",
  "max-height",
  "min-width",
  "min-height",
  "margin",
  "margin-top",
  "margin-right",
  "margin-bottom",
  "margin-left",
  "padding",
  "padding-top",
  "padding-right",
  "padding-bottom",
  "padding-left",

  // 边框
  "border",
  "border-width",
  "border-style",
  "border-color",
  "border-radius",

  // Flex布局
  "flex",
  "flex-direction",
  "flex-wrap",
  "flex-flow",
  "justify-content",
  "align-items",
  "align-content",
  "gap",

  // Grid布局
  "grid",
  "grid-template-columns",
  "grid-template-rows",
  "grid-gap",
  "grid-column",
  "grid-row",

  // 文字样式
  "font-family",
  "font-size",
  "font-weight",
  "line-height",
  "color",
  "text-align",
  "text-decoration",
  "text-transform",
  "letter-spacing",

  // 背景
  "background",
  "background-color",
  "background-image",
  "background-repeat",
  "background-position",
  "background-size",

  // 其他视觉效果
  "opacity",
  "box-shadow",
  "transform",
  "transition",
  "visibility",
  "overflow",
  "cursor",
] as const;

// 样式树类型定义
interface StyleNode {
  type: "Element";
  tagName: string;
  className?: string;
  "data-class-id": string;
  styles: {
    type: "StyleSheet";
    rules: Array<{
      type: "Rule";
      property: string;
      value: string;
      important: boolean;
    }>;
  };
  children: StyleNode[];
}

const CLASS_PREFIX = "JY-SITE-COM";
let index = -1;

// 修改 generateDataClassId 函数，添加缓存
let dataClassIdCache = new WeakMap<HTMLElement, string>();
const generateDataClassId = (el: HTMLElement): string => {
  const cached_dataClassId = dataClassIdCache.get(el);
  if (cached_dataClassId) return cached_dataClassId;

  index++;
  const random = Math.random().toString(36).substring(2, 8);
  const classNames = el.className
    ? el.className.split(" ").filter(Boolean)
    : [];

  if (el.id) {
    classNames.push(`id_${el.id}`);
  }

  const suffix = classNames.length > 0 ? "_" + classNames.join("_") : "";
  const dataClassId = `${CLASS_PREFIX}${suffix}#${random}_${el.tagName}_${index}`;

  dataClassIdCache.set(el, dataClassId);
  return dataClassId;
};

// 克隆元素
const cloneElement = (el: HTMLElement): HTMLElement => {
  const clonedEl = el.cloneNode(true) as HTMLElement;

  // 设置 data-class-id
  const dataClassId = generateDataClassId(el);
  clonedEl.setAttribute("data-class-id", dataClassId);

  Array.from(clonedEl.children).forEach((child) => {
    if (child instanceof HTMLElement) {
      const processedChild = cloneElement(child);
      child.parentNode?.replaceChild(processedChild, child);
    }
  });

  return clonedEl;
};

// 收集样式树
const collectStyleTree = (el: HTMLElement): StyleNode => {
  // 2. 获取计算样式
  const rules = resolveStyleContent(el);
  const dataClassId = generateDataClassId(el);

  // 4. 递归处理子元素
  const children = Array.from(el.children)
    .filter((child): child is HTMLElement => child instanceof HTMLElement)
    .map((child) => collectStyleTree(child));

  // 5. 构建并返回节点
  return {
    type: "Element",
    tagName: el.tagName.toLowerCase(),
    className: el.className || undefined,
    "data-class-id": dataClassId!,
    styles: {
      type: "StyleSheet",
      rules,
    },
    children,
  };
};

// 优化 resolveStyleContent 函数
const resolveStyleContent = (el: HTMLElement) => {
  const rules: StyleNode["styles"]["rules"] = [];
  const computedStyle = window.getComputedStyle(el);
  for (const key of STYLE_WHITELIST) {
    const value = computedStyle.getPropertyValue(key).trim();
    rules.push({
      type: "Rule",
      property: key,
      value,
      important: computedStyle.getPropertyPriority(key) === "important",
    });
  }

  return rules;
};

// 优化主方法
const getStyle = (el: HTMLElement) => {
  index = -1;
  dataClassIdCache = new WeakMap<HTMLElement, string>(); // 清除缓存
  const tree = collectStyleTree(el);
  const elements = cloneElement(el);

  console.log("elements", elements);

  return {
    elements,
    tree,
  };
};

export default getStyle;
