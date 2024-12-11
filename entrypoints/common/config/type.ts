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
export interface StyleNode {
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

// 定义每种元素的属性类型
export interface ElAttrCategory {
  common: string[];
  input: string[];
  img: string[];
  a: string[];
  button: string[];
  video: string[];
  audio: string[];
}

export type ElAttrCategoryKeys = Array<keyof ElAttrCategory>;

export type ElTagKeys = Omit<ElAttrCategoryKeys, "common">;
