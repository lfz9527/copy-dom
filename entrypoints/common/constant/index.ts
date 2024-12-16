// 唯一属性值的key
export const DATA_CLASS_ID = "JY-SITE-unique-ident-data" as const;

export const CLASS_PREFIX = "JY-SITE-COM";

export const RESET_CSS = `
  html,
  body {
    height: 100%;
    /* 文字风格 Sans-serif 各笔画粗细相同，Serif 笔画粗细不同，monospace 等宽体，cursive草书，fantasy梦幻 */
    font-family: "Microsoft YaHei", sans-serif, "Helvetica Neue", Helvetica, Arial,
      "黑体", "宋体", Arial;
    -webkit-tap-highlight-color: transparent;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  /* 重置各标签的默认样式 */
  body,
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
    font-size: 100%;
    font-weight: normal;
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    font-style: normal;
    /*  自动换行 */
    word-wrap: break-word;
    /*  强制英文单词断行 */
    word-break: break-all;
    border: 0;
  }
  /*  设置标签为块级分类 */
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
  /* 去除input标签的默认样式 */
  button,
  input,
  textarea {
    margin: 0;
    padding: 0;
    font-size: 100%;
    font-family: "Microsoft YaHei", sans-serif, "Helvetica Neue", Helvetica, Arial,
      "黑体", "宋体", Arial;
    line-height: 1em;
    background-color: transparent;
    border: 0;
    outline: none;
    appearance: none;
  }
  /*  禁止多文本框手动拖动大小 */
  textarea {
    appearance: none;
    resize: none;
  }
  /* 去掉按下的阴影盒子 */
  input,
  textarea,
  a {
    -webkit-tap-highlight-color: transparent;
  }
  /*  清除a标签下划线 */
  a,
  a:visited {
    text-decoration: none !important;
  }
  a:focus,
  a:active,
  a:hover {
    outline: none;
  }
  /*  清除列表前面的点 */
  ol,
  li,
  ul {
    list-style: none;
  }
  /*  清除IE下图片的边框 */
  img {
    font-size: 0;
    border-style: none;
  }
  /*  解决chrome浏览器默认黄色背景问题 */
  input:-webkit-autofill,
  textarea:-webkit-autofill,
  select:-webkit-autofill {
    box-shadow: 0 0 0 1000px #fff inset;
  }

  input[type="button"],
  input[type="submit"],
  input[type="file"],
  button {
    cursor: pointer;
  }

  /*  设置默认滚动条样式 */
  ::input-placeholder {
    color: #afbdcc;
  }
  :placeholder {
    color: #afbdcc;
  }
  ::placeholder {
    color: #afbdcc;
  }
  :input-placeholder {
    color: #afbdcc;
  }
  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  ::-webkit-scrollbar-track {
    background-color: #f5f5f5;
  }
  ::-webkit-scrollbar-track-piece {
    background-color: #f5f5f5;
    border-radius: 6px;
  }
  ::-webkit-scrollbar-thumb {
    background-color: #ccc;
    border-radius: 6px;
  }
  ::-webkit-scrollbar-corner {
    background-color: #f5f5f5;
  }
  ::-webkit-resizer {
    background-repeat: no-repeat;
    background-position: bottom right;
  }


  :root {
    --font-system: system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
  }
  `;

export const NodeTypes = {
  ELEMENT_NODE: 1, // 元素节点
  ATTRIBUTE_NODE: 2, // 属性节点
  TEXT_NODE: 3, // 文本节点
  CDATA_SECTION_NODE: 4, // CDATA 节点
  PROCESSING_INSTRUCTION_NODE: 7, // 处理指令节点
  COMMENT_NODE: 8, // 注释节点
  DOCUMENT_NODE: 9, // document 节点
  DOCUMENT_TYPE_NODE: 10, // documentType 节点
  DOCUMENT_FRAGMENT_NODE: 11, // documentFragment 节点
} as const;


export const CLICK_DIR = {
  0: 'LEFT_CLICK',
  2: "RIGHT_CLICK",
}