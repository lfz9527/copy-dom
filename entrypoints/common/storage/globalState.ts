import type { StateProps } from "~/entrypoints/types";
import { RESET_CSS } from "../constant";

// 全局状态缓存
export default class StateUtils {
  initialState = {
    reset_css: RESET_CSS,
  };
  state: StateProps = this.initialState;

  setState(state: StateProps) {
    this.state = { ...this.initialState, ...state };
    return localStorage.setItem("global:state", JSON.stringify(this.state));
  }
  getState() {
    try {
      const stateStr = localStorage.getItem("global:state");
      const state = JSON.parse(stateStr || "{}") as StateProps;
      const _savedBefore = !!state;
      this.state = {
        ...this.initialState,
        ...state,
      };
      if (!_savedBefore) {
        this.setState(this.state);
      }
      return this.state;
    } catch {
      return {
        ...this.initialState,
        ...this.state,
      };
    }
  }
}
