import { Tabs } from "wxt/browser";
import type { TabEvents } from "~/entrypoints/types";

export enum TAB_PLUGIN_ACTIONS {
  ON_CREATED = "onCreated",
  ON_DESTROYED = "onDestroyed",
}

export const TAB_EVENTS: Array<keyof Pick<Tabs.Static, TabEvents>> = [
  "onActivated",
  "onAttached",
  "onCreated",
  "onDetached",
  "onMoved",
  "onRemoved",
  "onReplaced",
  "onUpdated",
  "onHighlighted",
];

export default {
  TAB_PLUGIN_ACTIONS,
  TAB_EVENTS
};
