import type {
  pseudoConfig,
  StyleConfig,
  StyleNode,
  ElAttrCategory,
} from "./type";

export const STYLE_CONFIG: StyleConfig = {
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
  "text-overflow": { default: "clip", inherited: false, filter: true },

  // 背景
  // background: { default: "none", inherited: false, filter: true },
  "background-clip": { default: "border-box", inherited: false, filter: true },
  "background-color": {
    default: ["transparent", "rgba(0, 0, 0, 0)"],
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
  "white-space": { default: "normal", inherited: true, filter: true },

  // 滚动条样式
  "scrollbar-width": { default: "auto", inherited: false, filter: true },
  "scrollbar-color": { default: "auto", inherited: false, filter: true },
  "overflow-x": {
    default: ["clip", "visible"],
    inherited: false,
    filter: true,
  },
  "overflow-y": {
    default: ["clip", "visible"],
    inherited: false,
    filter: true,
  },
  "scroll-behavior": { default: "auto", inherited: false, filter: true },
  "scroll-snap-type": { default: "none", inherited: false, filter: true },
  "scroll-snap-align": { default: "none", inherited: false, filter: true },
  "overscroll-behavior": { default: "auto", inherited: false, filter: true },

  // placeholder 特有属性
  "::placeholder-shown": { default: "false", inherited: false },
  "placeholder-color": { default: "", inherited: false },

  // selection 特有属性
  "::selection-color": { default: "", inherited: false },
  "::selection-background": { default: "transparent", inherited: false },

  // before/after 特有属性
  content: { default: ["none", "normal"], inherited: false, filter: true },
} as const;

/** 从配置中派生其他常量  */
// 从配置中提取白名单
export const STYLE_WHITELIST = Object.keys(STYLE_CONFIG) as string[];

// 从配置中提取需要过滤的默认样式
export const DEFAULT_STYLES = Object.entries(STYLE_CONFIG)
  .filter(([_, value]) => !!value.filter)
  .reduce((acc, [key, value]) => {
    const defaults = [].concat(value.default as any) as string[];
    return {
      ...acc,
      [key]: defaults,
    };
  }, {} as Record<string, string[]>);

// 从配置中提取需要继承的默认样式属性
export const INHERITED_PROPERTIES = Object.entries(STYLE_CONFIG)
  .filter(([_, value]) => value.inherited)
  .map(([key]) => key) as string[];

// 定义属性依赖规则
export const PROPERTY_DEPENDENCIES = {
  border: {
    condition: (rules: StyleNode["styles"]["rules"]) =>
      !rules.some(
        (rule) => rule.property === "border-width" && rule.value === "0px"
      ),
    properties: (prop: string) =>
      prop.startsWith("border") && prop !== "border-radius",
  },
  "text-decoration": {
    condition: (rules: StyleNode["styles"]["rules"]) =>
      !rules.some(
        (rule) =>
          rule.property === "text-decoration-line" && rule.value === "none"
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

// 定义伪类和伪元素配置
export const PSEUDO_CONFIG: pseudoConfig = {
  // 伪类
  ":hover": true,
  ":active": true,
  ":focus": true,
  ":visited": true,
  ":disabled": true,
  ":checked": true,
  ":first-child": true,
  ":last-child": true,
  ":nth-child": true,

  // 伪元素
  "::before": true,
  "::after": true,
  "::placeholder": true,
  "::selection": true,
  "::first-line": true,
  "::first-letter": true,
  "::backdrop": true,
  "::marker": true,
  "::file-selector-button": true,
} as const;

// 需要保留的属性
export const ELEMENT_ATTRIBUTES: ElAttrCategory = {
  // 通用属性
  common: [
    "title", // 鼠标悬停时的提示文本
    "hidden", // 是否隐藏元素
  ],
  // 输入类元素
  input: [
    "value", // '输入框的值',
    "type", // '输入类型（text/password/checkbox等）',
    "placeholder", //  '输入提示文本',
    "disabled", // '是否禁用',
    "required", //'是否必填',
    "readOnly",
    "checked",
    "name",
    "min",
    "max",
    "step",
  ],
  // 图片
  img: ["src", "alt", "width", "height", "loading", "crossOrigin", "decoding"],
  // 链接
  a: ["href", "target", "rel", "download"],

  // 按钮
  button: ["type", "disabled"],
  // 视频
  video: [
    "src",
    "poster",
    "width",
    "height",
    "controls",
    "autoplay",
    "loop",
    "muted",
    "preload",
  ],
  // 音频
  audio: ["src", "controls", "autoplay", "loop", "muted", "preload"],
};
