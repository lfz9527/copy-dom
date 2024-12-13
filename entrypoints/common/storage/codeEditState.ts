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
    return storage.setItem("local:state", this.state);
  }
  async getCodeState() {
    const _savedBefore =
      await storage.getItem<CodeEditStateProps>("local:state");
    this.state = {
      ...this.initialState,
      ..._savedBefore,
    };
    if (!_savedBefore) {
      this.setCodeState(this.state);
    }
    return this.state;
  }
}
