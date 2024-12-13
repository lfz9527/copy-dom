import GlobalState from './globalState';
import CodeEditState from './codeEditState';

let _globalState: GlobalState;
let _codeEditState: CodeEditState;


export default class Store {
  static get globalState() {
    return _globalState;
  }
  static get codeEditState() {
    return _codeEditState;
  }
  static set codeEditState(codeEditState: CodeEditState) {
    _codeEditState = codeEditState;
  }
  static set globalState(globalState: GlobalState) {
    _globalState = globalState;
  }
}