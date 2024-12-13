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
    return storage.setItem("local:globalState", JSON.stringify(this.state));
  }
  getState() {
    try {
      const _savedBefore = storage.getItem("local:globalState");
      this.state = {
        ...this.initialState,
        ..._savedBefore,
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
