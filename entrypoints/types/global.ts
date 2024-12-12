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

export default { name: "global-types" };
