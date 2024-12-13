// 标签页事件
export type TabEvents =
  | "onActivated"
  | "onAttached"
  | "onCreated"
  | "onDetached"
  | "onMoved"
  | "onRemoved"
  | "onReplaced"
  | "onUpdated"
  | "onHighlighted";

export type PluginEvents = "onCreated" | "onDestroyed";

export interface BrowserMessageProps {
  msgType: string; // 消息类型
  data: any; // 消息内容
}

// 全局属性/状态
export interface StateProps {
  'reset_css': string;
}

// 代码编辑
export interface CodeEditStateProps {
  html:string,
  css:string,
}

export default { name: "global-types" };

