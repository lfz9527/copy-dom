import { DATA_CLASS_ID } from "../constant";

export interface pseudoConfig {
  [key: string]: boolean;
}


export interface StyleConfig {
  [key: string]: {
    default: string | string[]; // 默认值
    inherited?: boolean; // 是否为继承属性
    filter?: boolean; // 是否需要过滤默认值
  };
}


// 样式树类型定义
export  interface StyleNode {
  type: "Element";
  tagName: string;
  [DATA_CLASS_ID]: string;
  styles: {
    type: "StyleSheet";
    rules: Array<{
      type: "Rule";
      property: string;
      value: string;
      important: boolean;
      pseudo?: string; // 添加伪类/伪元素字段
    }>;
  };
  children: StyleNode[];
}
