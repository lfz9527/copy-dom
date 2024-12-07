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

const DATA_CLASS_ID = "JY-SITE-unique-ident-data" as const;
const CONNECTION_POINT = "__suffix__";

// 样式树类型定义
interface StyleNode {
  type: "Element";
  tagName: string;
  [DATA_CLASS_ID]: string;
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

let elementData = new WeakMap<HTMLElement, string>();
// 生成唯一的 classId 的表示
const generateDataClassId = (el: HTMLElement): string => {
  const classId = elementData.get(el);
  if (classId) return classId;

  index++;
  const random = Math.random().toString(36).substring(2, 8);
  const classNames = el.className
    ? el.className.split(" ").filter(Boolean)
    : [];

  if (el.id) {
    classNames.push(`${el.id}`);
  }

  const suffix = classNames.length > 0 ? "_" + classNames.join("_") : "";
  const dataClassId = `${CLASS_PREFIX}${suffix}${CONNECTION_POINT}${random}_${el.tagName}_${index}`;

  elementData.set(el, dataClassId);

  return dataClassId;
};

// 常见的节点类型常量
const NodeTypes = {
  ELEMENT_NODE: 1, // 元素节点 如 <div>
  ATTRIBUTE_NODE: 2, // 属性节点 如 class="example"
  TEXT_NODE: 3, // 文本节点 如 Hello World
  CDATA_SECTION_NODE: 4, // CDATA 节点 如 <![CDATA[...]]>
  PROCESSING_INSTRUCTION_NODE: 7, // 处理指令节点 如 <?xml ...?>
  COMMENT_NODE: 8, // 注释节点 如 <!-- ... -->
  DOCUMENT_NODE: 9, // document 节点
  DOCUMENT_TYPE_NODE: 10, // DOCTYPE 节点 如 <!DOCTYPE html>
  DOCUMENT_FRAGMENT_NODE: 11, // DocumentFragment 节点
} as const;

// 克隆元素，这里采用递归方式，主要是为了不影响页面的节点，而在节点添加属性
const cloneElement = (el: HTMLElement): HTMLElement => {
  const dataClassId = generateDataClassId(el);
  const clonedEl = el.cloneNode(false) as HTMLElement;
  clonedEl.setAttribute(DATA_CLASS_ID, dataClassId);

  // 处理所有类型的子节点
  Array.from(el.childNodes).forEach((child) => {
    switch (child.nodeType) {
      case Node.ELEMENT_NODE:
        // 元素节点需要递归处理
        clonedEl.appendChild(cloneElement(child as HTMLElement));
        break;
      case Node.TEXT_NODE:
        // 这些节点可以直接克隆
        clonedEl.appendChild(child.cloneNode(true));
        break;
      // 可以根据需要处理其他类型的节点
      default:
        console.warn(`未处理的节点类型: ${child.nodeType}`);
        break;
    }
  });

  return clonedEl;
};

// 收集样式树
const collectStyleTree = (el: HTMLElement): StyleNode => {
  // 获取计算样式
  const rules = resolveStyleContent(el);
  const dataClassId = generateDataClassId(el);

  // 给每个节点 添加 dataClassId
  el.setAttribute(DATA_CLASS_ID, dataClassId);

  // 递归处理子元素
  const children = Array.from(el.children)
    .filter((child): child is HTMLElement => child instanceof HTMLElement)
    .map((child) => collectStyleTree(child));

  // 构建并返回节点
  return {
    type: "Element",
    tagName: el.tagName.toLowerCase(),
    [DATA_CLASS_ID]: dataClassId!,
    styles: {
      type: "StyleSheet",
      rules,
    },
    children,
  };
};

// 处理获得的构造函数
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

// 将规则转换为CSS字符串
const ruleToString = (rule: StyleNode["styles"]["rules"][0]): string => {
  return `${rule.property}: ${rule.value}${
    rule.important ? " !important" : ""
  };`;
};

// 生成css
const generateCSS = (node: StyleNode): string => {
  let css = "";

  const rules = node.styles.rules
    .filter((rule) => rule.value !== "") // 过滤掉空值
    .map(ruleToString)
    .join("\n ");

  if (rules) {
    css += `.${node[DATA_CLASS_ID]} {\n  ${rules}\n}\n\n`;
  }

  // 递归处理子节点
  node.children.forEach((child) => {
    css += generateCSS(child);
  });

  return css;
};

// 清理并转换HTML元素
const formatElement = (el: HTMLElement): HTMLElement => {
  // 获取DATA_CLASS_ID并设置为class
  const dataClassId = el.getAttribute(DATA_CLASS_ID);

  // 删除这些属性
  ["class", "id", "style", DATA_CLASS_ID].forEach((attr) => {
    el.removeAttribute(attr);
  });

  // 重新设置新的类名
  if (dataClassId) {
    el.className = dataClassId;
  }
  // 递归处理子元素
  Array.from(el.children).forEach((child) => {
    if (child instanceof HTMLElement) {
      formatElement(child);
    }
  });

  return el;
};

// 定义组件树的类型
interface ComponentTree {
  html: HTMLElement;
  css: string;
}

// 生成完整的组件树
const generateComponentTree = ({ css, html }: ComponentTree): string => {
  // 生成预览代码
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      *{
      padding:0;
      margin:0;
      box-sizing: border-box;
    }
      ${css}
    </style>
  </head>
  <body>
    ${html.outerHTML}
  </body>
  </html>`;
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

// 优化主方法
const getStyle = (el: HTMLElement) => {
  console.log("正在生成组件....");

  index = -1;
  elementData = new WeakMap<HTMLElement, string>();
  const clonedEl = cloneElement(el);
  const cssTree = collectStyleTree(el);
  const elements = formatElement(clonedEl);
  const cssString = generateCSS(cssTree);
  const fullHtml = generateComponentTree({ css: cssString, html: elements });

  openFullHtmlNewTab(fullHtml);

  console.log("clonedEl", clonedEl);
  // console.log("cssString", cssTree);
  // console.log("fullHtml", fullHtml);

  console.log("组件生成完毕！！");

  return {
    elements,
    cssTree,
    cssString,
  };
};

export default getStyle;
