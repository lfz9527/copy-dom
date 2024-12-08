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
  "visibility",
  "overflow",
  "cursor",
] as const;

// 这是一个默认值，列表如果样式值为默认值，则不收集样式
const DEFAULT_STYLES: Partial<
  Record<(typeof STYLE_WHITELIST)[number], string>
> = {
  // 布局相关
  position: "static",
  top: "auto",
  right: "auto",
  bottom: "auto",
  left: "auto",
  float: "none",
  "z-index": "auto",

  // 盒模型
  width: "auto",
  height: "auto",
  "max-width": "none",
  "max-height": "none",
  "min-width": "0px",
  "min-height": "0px",
  margin: "0px",
  "margin-top": "0px",
  "margin-right": "0px",
  "margin-bottom": "0px",
  "margin-left": "0px",
  padding: "0px",
  "padding-top": "0px",
  "padding-right": "0px",
  "padding-bottom": "0px",
  "padding-left": "0px",

  // 边框
  border: "none",
  "border-width": "0px",
  "border-style": "none",
  "border-color": "rgb(0, 0, 0)",
  "border-radius": "0px",

  // Flex布局
  flex: "none",
  "flex-direction": "row",
  "flex-wrap": "nowrap",
  "flex-flow": "row nowrap",
  "justify-content": "normal",
  "align-items": "normal",
  "align-content": "normal",
  gap: "normal",

  // Grid布局
  grid: "none",
  "grid-template-columns": "none",
  "grid-template-rows": "none",
  "grid-gap": "normal",
  "grid-column": "auto",
  "grid-row": "auto",

  // 文字样式
  "font-family": "-apple-system",
  "font-size": "16px",
  "font-weight": "400",
  "line-height": "normal",
  color: "rgb(0, 0, 0)",
  "text-align": "start",
  "text-decoration": "none",
  "text-transform": "none",
  "letter-spacing": "normal",

  // 背景
  background: "none",
  // "background-color": "transparent",
  "background-image": "none",
  "background-repeat": "repeat",
  "background-position": "0% 0%",
  "background-size": "auto",

  // 其他视觉效果
  opacity: "1",
  "box-shadow": "none",
  transform: "none",
  visibility: "visible",
  overflow: "visible",
  cursor: "auto",
} as const;

// 从白名单中提取复合属性映射
const COMPOUND_PROPERTIES = {
  // 边距复合属性
  margin: STYLE_WHITELIST.filter((prop) =>
    [
      "margin",
      "margin-top",
      "margin-right",
      "margin-bottom",
      "margin-left",
    ].includes(prop)
  ),

  // 内边距复合属性
  padding: STYLE_WHITELIST.filter((prop) =>
    [
      "padding",
      "padding-top",
      "padding-right",
      "padding-bottom",
      "padding-left",
    ].includes(prop)
  ),

  // 边框复合属性
  border: STYLE_WHITELIST.filter((prop) =>
    ["border", "border-width", "border-style", "border-color"].includes(prop)
  ),
} as const;

// 唯一属性值的key
const DATA_CLASS_ID = "JY-SITE-unique-ident-data" as const;
//
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

// 克隆元素，这里采用递归方式，主要是为了不影响页面的节点，而在节点添加属性
const cloneElement = (el: HTMLElement): HTMLElement => {
  const dataClassId = generateDataClassId(el);
  const clonedEl = el.cloneNode(false) as HTMLElement;
  clonedEl.setAttribute(DATA_CLASS_ID, dataClassId);

  // 处理资源路径
  if (el instanceof HTMLImageElement && el.src) {
    // 处理图片src
    (clonedEl as HTMLImageElement).src = el.src;
  } else if (el instanceof HTMLAnchorElement && el.href) {
    // 处理链接href
    (clonedEl as HTMLAnchorElement).href = el.href;
  } else if (el instanceof HTMLLinkElement && el.href) {
    // 处理link标签
    (clonedEl as HTMLLinkElement).href = el.href;
  } else if (el instanceof HTMLScriptElement && el.src) {
    // 处理script标签
    (clonedEl as HTMLScriptElement).src = el.src;
  } else if (el instanceof HTMLSourceElement && el.src) {
    // 处理source标签
    (clonedEl as HTMLSourceElement).src = el.src;
  }

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

// 检查是否可以合并为简写形式
const canMergeToShorthand = (
  values: string[]
): { value: string; canMerge: boolean } => {
  if (values.length !== 4) return { value: "", canMerge: false };

  // 所有值相同
  if (values.every((v) => v === values[0])) {
    return { value: values[0], canMerge: true };
  }

  // 上下相同且左右相同
  if (values[0] === values[2] && values[1] === values[3]) {
    return { value: `${values[0]} ${values[1]}`, canMerge: true };
  }

  // 四个值都需要指定
  return {
    value: `${values[0]} ${values[1]} ${values[2]} ${values[3]}`,
    canMerge: true,
  };
};

// 处理获得的构造函数
const resolveStyleContent = (el: HTMLElement) => {
  const rules: StyleNode["styles"]["rules"] = [];
  const computedStyle = window.getComputedStyle(el);

  // 临时存储复合属性的值
  const compoundValues: Record<string, string[]> = {};
  for (const key of STYLE_WHITELIST) {
    const value = computedStyle.getPropertyValue(key).trim();

    // 如果值等于默认值，则跳过
    if (DEFAULT_STYLES[key] === value) {
      continue;
    }

    // 检查是否是复合属性的子属性
    let isSubProperty = false;
    for (const [compound, subProps] of Object.entries(COMPOUND_PROPERTIES)) {
      if (subProps.includes(key as any)) {
        compoundValues[compound] = compoundValues[compound] || [];
        const index = subProps.indexOf(key as any);
        compoundValues[compound][index] = value;
        isSubProperty = true;
        break;
      }
    }
    // 如果不是复合属性的子属性，直接添加
    if (!isSubProperty) {
      rules.push({
        type: "Rule",
        property: key,
        value,
        important: computedStyle.getPropertyPriority(key) === "important",
      });
    }
  }
  // 处理复合属性
  for (const [compound, subProps] of Object.entries(COMPOUND_PROPERTIES)) {
    const values = compoundValues[compound] || [];
    if (values.length === subProps.length) {
      const { value, canMerge } = canMergeToShorthand(values);
      if (canMerge) {
        rules.push({
          type: "Rule",
          property: compound,
          value,
          important: false,
        });
      } else {
        // 如果不能合并，使用单独的属性
        values.forEach((value, index) => {
          if (value && value !== DEFAULT_STYLES[subProps[index]]) {
            rules.push({
              type: "Rule",
              property: subProps[index],
              value,
              important:
                computedStyle.getPropertyPriority(subProps[index]) ===
                "important",
            });
          }
        });
      }
    }
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

  console.log("COMPOUND_PROPERTIES", COMPOUND_PROPERTIES);

  index = -1;
  elementData = new WeakMap<HTMLElement, string>();
  // 克隆 dom
  const clonedEl = cloneElement(el);
  // 生成css 树
  const cssTree = collectStyleTree(el);
  // 处理dome 结构
  const elements = formatElement(clonedEl);
  // css 树生成 css 样式表
  const cssString = generateCSS(cssTree);
  // css + dom 结构 生成完整的html 文档
  const fullHtml = generateComponentTree({ css: cssString, html: elements });

  // 在新的页面打开完整的html文件
  openFullHtmlNewTab(fullHtml);

  // console.log("clonedEl", clonedEl);
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
