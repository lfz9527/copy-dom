import type { CodeEditStateProps } from "~/entrypoints/types";

// 全局状态缓存
export default class CodeEdit {
  initialState = {
    css: "",
    html: "",
  };
  state: CodeEditStateProps = this.initialState;

  setCodeState(state: CodeEditStateProps) {
    this.state = { ...this.initialState, ...state };
    return localStorage.setItem("global:state", JSON.stringify(this.state));
  }
  getCodeState() {
    try {
      const stateStr = localStorage.getItem("codeEdit:state");
      const state = JSON.parse(stateStr || "{}") as CodeEditStateProps;
      const _savedBefore = !!state;
      this.state = {
        ...this.initialState,
        ...state,
      };
      if (!_savedBefore) {
        this.setCodeState(this.state);
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
