import utils from "../utils";

interface StyleConfig {
  [key: string]: {
    default: string; // 默认值
    inherited: boolean; // 是否为继承属性
    filter?: boolean; // 是否需要过滤默认值
  };
}

const STYLE_CONFIG: StyleConfig = {
  // 布局相关
  display: { default: "inline", inherited: false },
  position: { default: "static", inherited: false, filter: true },
  top: { default: "auto", inherited: false, filter: true },
  right: { default: "auto", inherited: false, filter: true },
  bottom: { default: "auto", inherited: false, filter: true },
  left: { default: "auto", inherited: false, filter: true },
  float: { default: "none", inherited: false, filter: true },
  clear: { default: "none", inherited: false, filter: true },
  "z-index": { default: "auto", inherited: false, filter: true },
  "box-sizing": { default: "content-box", inherited: false, filter: true },

  // 盒模型
  width: { default: "auto", inherited: false, filter: true },
  height: { default: "auto", inherited: false, filter: true },
  margin: { default: "0px", inherited: false, filter: true },
  padding: { default: "0px", inherited: false, filter: true },

  // 边框
  "border-style": { default: "none", inherited: false, filter: true },
  "border-width": { default: "0px", inherited: false, filter: true },
  "border-color": { default: "", inherited: false, filter: true },
  "border-radius": { default: "0px", inherited: false, filter: true },

  // Flex布局
  flex: { default: "0 1 auto", inherited: false, filter: true },
  "flex-direction": { default: "row", inherited: false, filter: true },
  "flex-wrap": { default: "nowrap", inherited: false, filter: true },
  "flex-flow": { default: "row nowrap", inherited: false, filter: true },
  "justify-content": { default: "normal", inherited: false, filter: true },
  "align-items": { default: "normal", inherited: false, filter: true },
  "align-content": { default: "normal", inherited: false, filter: true },
  gap: { default: "normal", inherited: false, filter: true },

  // 文字样式
  "font-size": { default: "16px", inherited: true },
  "font-weight": { default: "normal", inherited: true, filter: true },
  "line-height": { default: "normal", inherited: true, filter: true },
  color: { default: "rgb(0, 0, 0)", inherited: true, filter: true },
  "text-align": { default: "start", inherited: true, filter: true },
  "text-decoration": { default: "none", inherited: false, filter: true },
  "text-decoration-line": { default: "none", inherited: false, filter: true },
  "text-transform": { default: "none", inherited: true, filter: true },
  "letter-spacing": { default: "normal", inherited: true, filter: true },

  // 背景
  // background: { default: "none", inherited: false, filter: true },
  "background-clip": { default: "border-box", inherited: false, filter: true },
  "background-color": {
    default: "transparent",
    inherited: false,
    filter: true,
  },
  "background-image": { default: "none", inherited: false, filter: true },
  "background-origin": {
    default: "padding-box",
    inherited: false,
    filter: true,
  },
  "background-position-y": { default: "0%", inherited: false, filter: true },
  "background-position-x": { default: "0%", inherited: false, filter: true },
  "background-repeat": { default: "repeat", inherited: false, filter: true },
  "background-size": { default: "auto", inherited: false, filter: true },
  "backdrop-filter": { default: "none", inherited: false, filter: true },

  // 其他视觉效果
  opacity: { default: "1", inherited: false, filter: true },
  "box-shadow": { default: "none", inherited: false, filter: true },
  transform: { default: "none", inherited: false, filter: true },
  visibility: { default: "visible", inherited: true, filter: true },
  cursor: { default: "auto", inherited: true, filter: true },

  // 滚动条样式
  "scrollbar-width": { default: "auto", inherited: false, filter: true },
  "scrollbar-color": { default: "auto", inherited: false, filter: true },
  "overflow-x": { default: "visible", inherited: false, filter: true },
  "overflow-y": { default: "visible", inherited: false, filter: true },
  "scroll-behavior": { default: "auto", inherited: false, filter: true },
  "scroll-snap-type": { default: "none", inherited: false, filter: true },
  "scroll-snap-align": { default: "none", inherited: false, filter: true },
  "overscroll-behavior": { default: "auto", inherited: false, filter: true },
} as const;

/** 从配置中派生其他常量  */
// 从配置中提取白名单
const STYLE_WHITELIST = Object.keys(STYLE_CONFIG) as string[];

// 从配置中提取需要过滤的默认样式
const DEFAULT_STYLES = Object.entries(STYLE_CONFIG)
  .filter(([_, value]) => !!value.filter)
  .reduce(
    (acc, [key, value]) => ({
      ...acc,
      [key]: value.default,
    }),
    {} as Record<string, string>
  );

// 从配置中提取需要继承的默认样式属性
const INHERITED_PROPERTIES = Object.entries(STYLE_CONFIG)
  .filter(([_, value]) => value.inherited)
  .map(([key]) => key) as (keyof typeof STYLE_CONFIG)[];

// 定义属性依赖规则
const PROPERTY_DEPENDENCIES = {
  border: {
    condition: (rules: StyleNode["styles"]["rules"]) =>
      !rules.some(
        (rule) => rule.property === "border-width" && rule.value === "0px"
      ),
    properties: (prop: string) => prop.startsWith("border"),
  },
  "text-decoration": {
    condition: (rules: StyleNode["styles"]["rules"]) =>
      !rules.some(
        (rule) => rule.property === "text-decoration-line" && rule.value === "none"
      ),
    properties: (prop: string) => prop.startsWith("text-decoration"),
  },
  flex: {
    condition: (rules: StyleNode["styles"]["rules"]) =>
      rules.some(
        (rule) => rule.property === "display" && rule.value === "flex"
      ),
    properties: (prop: string) =>
      ["justify-content", "align-items"].includes(prop),
  },
  grid: {
    condition: (rules: StyleNode["styles"]["rules"]) =>
      rules.some(
        (rule) => rule.property === "display" && rule.value === "grid"
      ),
    properties: (prop: string) => prop.startsWith("grid"),
  },
} as const;

// 唯一属性值的key
const DATA_CLASS_ID = "JY-SITE-unique-ident-data" as const;

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
  const classNames = el.className
    ? el.className.split(" ").filter(Boolean)
    : [];

  if (el.id) {
    classNames.push(`${el.id}`);
  }

  const suffix = classNames.length > 0 ? "_" + classNames.join("_") : "";
  const dataClassId = `${CLASS_PREFIX}${suffix}_${el.tagName}${index}`;

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
        utils.doLog(`未处理的节点类型: ${child.nodeType}`);
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

  // 过滤掉属性依赖的属性
  const filterDependentProperties = (
    rules: StyleNode["styles"]["rules"]
  ): StyleNode["styles"]["rules"] => {
    let filteredRules = [...rules];

    Object.entries(PROPERTY_DEPENDENCIES).forEach(([_, dependency]) => {
      if (!dependency.condition(rules)) {
        // 如果条件不满足，过滤掉相关属性
        filteredRules = filteredRules.filter(
          (rule) => !dependency.properties(rule.property)
        );
      }
    });

    return filteredRules;
  };

  // 过滤继承属性
  const filterInheritedProperties = (
    rules: StyleNode["styles"]["rules"]
  ): StyleNode["styles"]["rules"] => {
    return rules.filter((rule) => {
      const inheritedValue =
        INHERITED_PROPERTIES[
          rule.property as keyof typeof INHERITED_PROPERTIES
        ];
      return !inheritedValue || rule.value !== inheritedValue;
    });
  };

  // 前面进行合并时 可能也会产生默认值，所以最后再处理默认值
  const realRules = filterDependentProperties(
    filterInheritedProperties(
      rules.filter(
        (rule) =>
          rule.value !==
          DEFAULT_STYLES[rule.property as keyof typeof DEFAULT_STYLES]
      )
    )
  );
  return realRules;
  // return rules;
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
          a,
      body,
      center,
      cite,
      code,
      dd,
      del,
      div,
      dl,
      dt,
      em,
      fieldset,
      figcaption,
      figure,
      footer,
      form,
      h1,
      h2,
      h3,
      h4,
      h5,
      h6,
      header,
      hr,
      html,
      img,
      input,
      label,
      legend,
      li,
      mark,
      ol,
      p,
      section,
      span,
      textarea,
      time,
      td,
      th,
      ul {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
        font-style: normal;

        word-wrap: break-word;

        word-break: break-all;
        border: 0;
      }

      article,
      aside,
      details,
      fieldset,
      figcaption,
      figure,
      footer,
      header,
      main,
      nav,
      section {
        display: block;
      }

      button,
      input,
      textarea {
        margin: 0;
        padding: 0;
        font-size: 1em;
        font-family: "Microsoft YaHei", sans-serif, "Helvetica Neue", Helvetica, Arial, "黑体", "宋体", Arial;
        line-height: 1em;
        background-color: transparent;
        border: 0;
        outline: none;
        appearance: none;
      }

      textarea {
        appearance: none;
        resize: none;
      }

      input,
      textarea,
      a {
        -webkit-tap-highlight-color: transparent;
      }

          a,
          a:visited {
              text-decoration: none !important;
          }
      a:focus,
      a:active,
      a:hover {
        outline: none;
      }

      ol,
      li,
      ul {
        list-style: none;
      }

      img {
        font-size: 0;
        border-style: none;
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
  utils.doLog("正在生成组件....");

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

  // console.log("cssTree:", cssTree);
  // console.log("cssString:", cssString);

  utils.doLog("组件生成完毕！！");

  return {
    elements,
    cssTree,
    cssString,
  };
};

export default getStyle;
