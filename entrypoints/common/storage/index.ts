import Store from "./instanceStore";

import GlobalState from "./globalState";
import CodeEditState from "./codeEditState";

Store.globalState = new GlobalState();
Store.codeEditState = new CodeEditState();

export const globalState = Store.globalState;
export const codeEditState = Store.codeEditState;

