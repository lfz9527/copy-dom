import { useState } from "react";
import { doLog } from "../utils";
import {
  PSEUDO_CONFIG,
  STYLE_WHITELIST,
  DEFAULT_STYLES,
  INHERITED_PROPERTIES,
  PROPERTY_DEPENDENCIES,
  ELEMENT_ATTRIBUTES,
} from "../config";
import type {
  StyleNode,
  ElAttrCategoryKeys,
  ElAttrCategory,
  ElTagKeys,
} from "../config/type";
import { CLASS_PREFIX, DATA_CLASS_ID, RESET_CSS, NodeTypes } from "../constant";

let elementData = new WeakMap<HTMLElement, string>();
let index = -1;

const useCreateComponent = () => {
  const [fullHtml, setFullHtml] = useState("");

  // 生成唯一的 classId 的表示
  const generateDataClassId = (el: HTMLElement): string => {
    const classId = elementData.get(el);
    if (classId) return classId;

    index++;

    const dataClassId = `${CLASS_PREFIX}_${el.tagName}${index}`;

    elementData.set(el, dataClassId);

    return dataClassId;
  };

  // 检查是否是 style 元素
  const isStyleElement = (node: Node): node is HTMLStyleElement => {
    return (
      node.nodeType === NodeTypes.ELEMENT_NODE &&
      node instanceof HTMLStyleElement
    );
  };

  // 检查是否是 script 元素
  const isScriptElement = (node: Node): node is HTMLScriptElement => {
    return (
      node.nodeType === NodeTypes.ELEMENT_NODE &&
      node instanceof HTMLScriptElement
    );
  };

  // 克隆元素，包括伪类/伪元素样式
  const cloneElement = (el: HTMLElement): HTMLElement => {
    const dataClassId = generateDataClassId(el);
    const clonedEl = el.cloneNode(false) as HTMLElement;
    clonedEl.setAttribute(DATA_CLASS_ID, dataClassId);

    // 处理资源路径
    if (el instanceof HTMLImageElement && el.src) {
      // 处理图片src
      (clonedEl as HTMLImageElement).src = el.src;
    } else if (el instanceof HTMLAnchorElement && el.href) {
      // 处理链接href
      (clonedEl as HTMLAnchorElement).href = el.href;
    } else if (el instanceof HTMLLinkElement && el.href) {
      // 处理link标签
      (clonedEl as HTMLLinkElement).href = el.href;
    } else if (el instanceof HTMLScriptElement && el.src) {
      // 处理script标签
      (clonedEl as HTMLScriptElement).src = el.src;
    } else if (el instanceof HTMLSourceElement && el.src) {
      // 处理source标签
      (clonedEl as HTMLSourceElement).src = el.src;
    }

    // 处理子节点
    Array.from(el.childNodes).forEach((child) => {
      switch (child.nodeType) {
        case NodeTypes.ELEMENT_NODE:
          // 元素点需要递归处理
          // 跳过 style 和 script 标签
          if (
            !(child instanceof HTMLStyleElement) &&
            !(child instanceof HTMLScriptElement)
          ) {
            clonedEl.appendChild(cloneElement(child as HTMLElement));
          }
          break;
        case NodeTypes.TEXT_NODE:
          // 这些节点可以直接克隆
          clonedEl.appendChild(child.cloneNode(true));
          break;
        // 可以根据需要处理其他类型的节点
        default:
          doLog(`未处理的节点类型: ${child.nodeType}`);
          break;
      }
    });

    return clonedEl;
  };

  // 收集样式树
  const collectStyleTree = (el: HTMLElement): StyleNode => {
    // 获取计算样式
    const rules = resolveStyleContent(el);
    const dataClassId = generateDataClassId(el);

    // 给每个节点 添加 dataClassId
    el.setAttribute(DATA_CLASS_ID, dataClassId);

    // 递归处理子元素
    const children = Array.from(el.children)
      .filter((child): child is HTMLElement => child instanceof HTMLElement)
      .map((child) => collectStyleTree(child));

    // 构建并返回节点
    return {
      type: "Element",
      tagName: el.tagName.toLowerCase(),
      [DATA_CLASS_ID]: dataClassId!,
      styles: {
        type: "StyleSheet",
        rules,
      },
      children,
    };
  };

  // 添加继承样式处理工具
  const getInheritedStyles = (el: HTMLElement): Record<string, string> => {
    const inheritedStyles: Record<string, string> = {};
    const isRootDom = el.getAttribute("is_root_dom") === "true";
    const currentEl = isRootDom ? null : el.parentElement;

    // 果没有父元素，返回空对象
    if (!currentEl) return inheritedStyles;
    // 获取所有继承属性的当前计算值
    const computedStyle = window.getComputedStyle(currentEl);

    INHERITED_PROPERTIES.forEach((property: string) => {
      let value = computedStyle.getPropertyValue(property);

      // 处理特殊的继承值
      switch (property) {
        case "font-size":
          // 1. font-size 的相对单位处理
          if (value.includes("em") || value.includes("rem")) {
            const parentSize = parseFloat(
              computedStyle.getPropertyValue("font-size")
            );
            const size = parseFloat(value);
            value = `${parentSize * size}px`;
          } else if (value.includes("%")) {
            const parentSize = parseFloat(
              computedStyle.getPropertyValue("font-size")
            );
            value = `${(parentSize * parseFloat(value)) / 100}px`;
          }
          break;

        case "line-height":
          // 2. line-height 的数字倍数处理
          if (
            !value.includes("px") &&
            !value.includes("%") &&
            !value.includes("em")
          ) {
            const fontSize = parseFloat(
              computedStyle.getPropertyValue("font-size")
            );
            value = `${parseFloat(value) * fontSize}px`;
          }
          break;

        case "color":
          // 3. color 的 currentColor 处理
          if (value === "currentColor") {
            value = computedStyle.getPropertyValue("color");
          }
          break;

        case "font-weight":
          // 4. font-weight 的关键字处理
          if (value === "lighter") {
            const parentWeight = parseInt(
              computedStyle.getPropertyValue("font-weight")
            );
            value = `${Math.max(parentWeight - 100, 100)}`;
          } else if (value === "bolder") {
            const parentWeight = parseInt(
              computedStyle.getPropertyValue("font-weight")
            );
            value = `${Math.min(parentWeight + 100, 900)}`;
          }
          break;

        case "text-align":
          // 5. text-align 的 start/end 处理
          if (value === "start") {
            value = "left"; // 简化处理，实际应考虑文字方向
          } else if (value === "end") {
            value = "right";
          }
          break;
      }

      inheritedStyles[property] = value;
    });

    return inheritedStyles;
  };

  // 检查伪类/伪元素是否真正被应用
  const hasPseudoStyles = (el: HTMLElement, pseudo: string): boolean => {
    const style = window.getComputedStyle(el, pseudo);

    // 检查元素是否有相关的样式规则
    const hasStyleRule = Array.from(document.styleSheets).some((sheet) => {
      try {
        const rules = Array.from(sheet.cssRules);
        return rules.some((rule) => {
          if (rule instanceof CSSStyleRule) {
            const selector = rule.selectorText;
            // 检查选择器是否包含该伪类/伪元素
            return (
              selector.includes(pseudo) &&
              el.matches(selector.replace(pseudo, ""))
            );
          }
          return false;
        });
      } catch {
        // 跨域样式表会抛出错误，忽略
        return false;
      }
    });

    // 如果没有相关的样式规则，直接返回 false
    if (!hasStyleRule) {
      return false;
    }

    // 特殊伪元素的处理
    switch (pseudo) {
      case "::before":
      case "::after":
        const content = style.getPropertyValue("content");
        const display = style.getPropertyValue("display");
        return (
          content !== "none" &&
          content !== '""' &&
          content !== "''" &&
          display !== "none"
        );

      case "::marker":
        return (
          el.tagName.toLowerCase() === "li" &&
          style.getPropertyValue("list-style-type") !== "none"
        );

      case "::backdrop":
        return false; // 除非明确设置，否则不收集 backdrop

      case "::selection":
        return false; // 默认不收集 selection 样式

      case "::first-line":
      case "::first-letter":
        // 只有在明确设置了样式规则时才收集
        return (
          hasStyleRule &&
          window.getComputedStyle(el).display.includes("block") &&
          (el.textContent ?? "").trim().length > 0
        );

      case "::file-selector-button":
        return (
          el.tagName.toLowerCase() === "input" &&
          (el as HTMLInputElement).type === "file" &&
          hasStyleRule
        );

      case ":hover":
      case ":active":
      case ":focus":
        return isInteractiveElement(el) && hasStyleRule;

      case ":disabled":
      case ":enabled":
        return isFormElement(el) && hasStyleRule;

      default:
        return false; // 对于未明确处理的伪类/伪元素，默认不收集
    }
  };

  // 修改伪类和伪元素样式处理函数
  const resolvePseudoStyle = (
    el: HTMLElement
  ): StyleNode["styles"]["rules"] => {
    const rules: StyleNode["styles"]["rules"] = [];

    // 遍历所有配置的伪类和伪元素
    Object.keys(PSEUDO_CONFIG).forEach((pseudo) => {
      // 首先检查是否真正应用了伪类/伪元素
      if (!hasPseudoStyles(el, pseudo)) {
        return; // 如果没有应用，直接跳过
      }

      // 获取带伪类/伪元素的计算样式
      const pseudoStyle = window.getComputedStyle(el, pseudo);

      // 遍历所有样式属性
      STYLE_WHITELIST.forEach((property) => {
        const pseudoValue = pseudoStyle.getPropertyValue(property).trim();
        // 只收集与普通状态不同且非空的样式
        if (pseudoValue !== "") {
          // 特殊处理某些伪类
          switch (pseudo) {
            case ":hover":
              if (!isInteractiveElement(el)) return;
              break;

            case ":disabled":
              if (!isFormElement(el)) return;
              break;

            default:
              rules.push({
                type: "Rule",
                property,
                value: pseudoValue,
                important:
                  pseudoStyle.getPropertyPriority(property) === "important",
                pseudo,
              });
          }
        }
      });
    });

    return rules;
  };

  // 辅助函数：判断是否是可交互元素
  const isInteractiveElement = (el: HTMLElement): boolean => {
    const interactiveTags = ["a", "button", "input", "select", "textarea"];
    return (
      interactiveTags.includes(el.tagName.toLowerCase()) ||
      el.hasAttribute("onclick") ||
      el.hasAttribute("role")
    );
  };

  // 辅助函数：判断是否是表单元素
  const isFormElement = (el: HTMLElement): boolean => {
    const formTags = ["input", "select", "textarea", "button"];
    return formTags.includes(el.tagName.toLowerCase());
  };

  // 处理获得的构造函数
  const resolveStyleContent = (el: HTMLElement) => {
    let rules: StyleNode["styles"]["rules"] = [];
    const computedStyle = window.getComputedStyle(el);
    // 获取继承样式
    const inheritedStyles = getInheritedStyles(el);

    for (const key of STYLE_WHITELIST) {
      const value = computedStyle.getPropertyValue(key).trim();

      if (INHERITED_PROPERTIES.includes(key as any)) {
        // 如果值与继承值不同，或者是显式设置的值，则收集
        const inheritedValue = inheritedStyles[key];
        if (
          value !== inheritedValue ||
          computedStyle.getPropertyPriority(key) === "important"
        ) {
          rules.push({
            type: "Rule",
            property: key,
            value,
            important: computedStyle.getPropertyPriority(key) === "important",
          });
        }
      } else {
        rules.push({
          type: "Rule",
          property: key,
          value,
          important: computedStyle.getPropertyPriority(key) === "important",
        });
      }
    }

    // 修改样式值比较逻辑
    const isDefaultValue = (property: string, value: string): boolean => {
      const defaults = DEFAULT_STYLES[property];
      return defaults ? defaults.includes(value) : false;
    };

    // 过滤掉属性依赖的属性
    const filterDependentProperties = (
      rules: StyleNode["styles"]["rules"]
    ): StyleNode["styles"]["rules"] => {
      let filteredRules = [...rules];

      Object.entries(PROPERTY_DEPENDENCIES).forEach(([_, dependency]) => {
        if (!dependency.condition(rules)) {
          // 如果条件不满足，过滤掉相关属性
          filteredRules = filteredRules.filter(
            (rule) => !dependency.properties(rule.property)
          );
        }
      });

      return filteredRules;
    };

    // 收集伪类和伪元素样式
    const pseudoRules = resolvePseudoStyle(el);

    rules = [...rules, ...pseudoRules];

    // 前面进行过滤时 可能也会产生默认值，所以最后再处理默认值
    const realRules = filterDependentProperties(rules).filter(
      (rule) => !isDefaultValue(rule.property, rule.value)
    );
    return realRules;
  };

  // 将规则转换为CSS字符串
  const ruleToString = (rule: StyleNode["styles"]["rules"][0]): string => {
    return `${rule.property}: ${rule.value}${
      rule.important ? " !important" : ""
    };`;
  };

  // 辅助函数 比较两个规则数组是否相同
  const areRulesEqual = (
    rules1: StyleNode["styles"]["rules"],
    rules2: StyleNode["styles"]["rules"]
  ): boolean => {
    if (rules1.length !== rules2.length) return false;

    return rules1.every((rule1) => {
      return rules2.some(
        (rule2) =>
          rule1.property === rule2.property &&
          rule1.value === rule2.value &&
          rule1.important === rule2.important &&
          rule1.pseudo === rule2.pseudo
      );
    });
  };

  // CSS生成逻辑
  const generateCSS = (node: StyleNode): string => {
    let css = "";

    // // 按伪类/伪元素分组规则
    // const normalRules: StyleNode["styles"]["rules"] = [];
    // const pseudoRules: Record<string, StyleNode["styles"]["rules"]> = {};

    // 按照层级分组节点
    const groupNodesByLevel = (node: StyleNode): Map<number, StyleNode[]> => {
      const levelMap = new Map<number, StyleNode[]>();

      const traverse = (node: StyleNode, level: number) => {
        if (!levelMap.has(level)) {
          levelMap.set(level, []);
        }
        levelMap.get(level)!.push(node);
        node.children.forEach((child) => traverse(child, level + 1));
      };

      traverse(node, 0);

      return levelMap;
    };
    const levelMap = groupNodesByLevel(node);

    // 处理每一层级的节点
    levelMap.forEach((nodes, level) => {
      // 按普通样式规则分组
      const normalStyleGroups = new Map<string, string[]>();
      // 按伪类/伪元素样式规则分组
      const pseudoStyleGroups = new Map<string, Map<string, string[]>>();

      nodes.forEach((node) => {
        const normalRules: StyleNode["styles"]["rules"] = [];
        const pseudoRules: Record<string, StyleNode["styles"]["rules"]> = {};

        // 分离普通规则和伪类规则
        node.styles.rules.forEach((rule) => {
          if (rule.pseudo) {
            pseudoRules[rule.pseudo] = pseudoRules[rule.pseudo] || [];
            pseudoRules[rule.pseudo].push(rule);
          } else {
            normalRules.push(rule);
          }
        });

        // 处理普通样式
        const normalStyleKey = JSON.stringify(normalRules);
        if (!normalStyleGroups.has(normalStyleKey)) {
          normalStyleGroups.set(normalStyleKey, []);
        }
        normalStyleGroups.get(normalStyleKey)!.push(node[DATA_CLASS_ID]);

        // 处理伪类样式
        Object.entries(pseudoRules).forEach(([pseudo, rules]) => {
          if (!pseudoStyleGroups.has(pseudo)) {
            pseudoStyleGroups.set(pseudo, new Map());
          }
          const pseudoGroupMap = pseudoStyleGroups.get(pseudo)!;
          const pseudoStyleKey = JSON.stringify(rules);

          if (!pseudoGroupMap.has(pseudoStyleKey)) {
            pseudoGroupMap.set(pseudoStyleKey, []);
          }
          pseudoGroupMap.get(pseudoStyleKey)!.push(node[DATA_CLASS_ID]);
        });
      });

      // 生成普通样式
      normalStyleGroups.forEach((classIds, rulesKey) => {
        const rules = JSON.parse(rulesKey);
        if (rules.length > 0) {
          const selectors = classIds.map((id) => `.${id}`).join(", ");
          const styles = rules
            .filter((rule: any) => rule.value !== "")
            .map((rule: any) => ruleToString(rule))
            .join("\n  ");

          if (styles) {
            css += `${selectors} {\n  ${styles}\n}\n\n`;
          }
        }
      });

      // 生成伪类样式
      pseudoStyleGroups.forEach((pseudoGroupMap, pseudo) => {
        pseudoGroupMap.forEach((classIds, rulesKey) => {
          const rules = JSON.parse(rulesKey);
          if (rules.length > 0) {
            const selectors = classIds
              .map((id) => `.${id}${pseudo}`)
              .join(", ");
            const styles = rules
              .filter((rule: any) => rule.value !== "")
              .map((rule: any) => ruleToString(rule))
              .join("\n  ");

            if (styles) {
              css += `${selectors} {\n  ${styles}\n}\n\n`;
            }
          }
        });
      });
    });

    // node.styles.rules.forEach((rule) => {
    //   if (rule.pseudo) {
    //     pseudoRules[rule.pseudo] = pseudoRules[rule.pseudo] || [];
    //     pseudoRules[rule.pseudo].push(rule);
    //   } else {
    //     normalRules.push(rule);
    //   }
    // });

    // // 生成普通样式
    // const normalStyles = normalRules
    //   .filter((rule) => rule.value !== "")
    //   .map(ruleToString)
    //   .join("\n  ");

    // if (normalStyles) {
    //   css += `.${node[DATA_CLASS_ID]} {\n  ${normalStyles}\n}\n\n`;
    // }

    // // 生成伪类/伪元素样式
    // Object.entries(pseudoRules).forEach(([pseudo, rules]) => {
    //   const pseudoStyles = rules
    //     .filter((rule) => rule.value !== "")
    //     .map(ruleToString)
    //     .join("\n  ");

    //   if (pseudoStyles) {
    //     css += `.${node[DATA_CLASS_ID]}${pseudo} {\n  ${pseudoStyles}\n}\n\n`;
    //   }
    // });

    // 递归处理子节点
    // node.children.forEach((child) => {
    //   css += generateCSS(child);
    // });

    return css;
  };

  // 清理并转换HTML元素
  const formatElement = (el: HTMLElement): HTMLElement => {
    const tagName = el.tagName.toLowerCase();
    // 获取DATA_CLASS_ID并设置为class
    const dataClassId = el.getAttribute(DATA_CLASS_ID);
    // 获取元素的所有属性
    const attributes = el.attributes;
    // 属性分类的key
    const attrCateKeys: ElAttrCategoryKeys = Object.keys(
      ELEMENT_ATTRIBUTES
    ) as Array<keyof ElAttrCategory>;

    // 预设的标签名
    const ElTagNames: ElTagKeys | string[] = attrCateKeys.filter(
      (v) => v !== "common"
    );

    // 通用属性
    const commonAttributes = ELEMENT_ATTRIBUTES["common"];

    const currentAttributes = [
      ...commonAttributes,
      ...(ElTagNames.includes(tagName as keyof ElAttrCategory)
        ? ELEMENT_ATTRIBUTES[tagName as keyof ElAttrCategory]
        : []),
    ];

    Array.from(attributes).forEach((v) => {
      // 检查属性是否在当前标签的属性列表中,在的话就保留，不在的话就删除
      if (!currentAttributes.includes(v.name)) {
        el.removeAttribute(v.name);
      }
    });

    // 重新设置类名
    if (dataClassId) {
      el.className = dataClassId;
    }

    // 递归处理子元素
    Array.from(el.children).forEach((child) => {
      if (child instanceof HTMLElement) {
        formatElement(child);
      }
    });

    return el;
  };

  // 定义组件树的类型
  interface ComponentTree {
    html: HTMLElement;
    css: string;
  }

  // 生成完整的组件树
  const generateComponentTree = ({ css, html }: ComponentTree): string => {
    // 生成预览代码
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Generated Document</title>
        <style>
        ${RESET_CSS}
          ${css}
        </style>
      </head>
      <body>
      ${html.outerHTML}
      </body>
      </html>
      `;
  };

  // 清理其他资源
  const cleanup = () => {
    index = -1;
    elementData = new WeakMap<HTMLElement, string>();
  };

  const createFullHtml = (el: HTMLElement) => {
    doLog("正在生成组件....");

    cleanup();

    // 设置根节点属性
    el.setAttribute("is_root_dom", "true");

    // 克隆 dom
    const clonedEl = cloneElement(el);
    // 生成css 树
    const cssTree = collectStyleTree(el);

    // 处理dome 结构
    const elements = formatElement(clonedEl);
    // css 树生成 css 样式表
    const cssString = generateCSS(cssTree);
    // css + dom 结构 生成完整的html 文档
    const fullHtml = generateComponentTree({ css: cssString, html: elements });

    setFullHtml(fullHtml);

    console.log('cssString',cssString);
    

    doLog("组件生成完毕！！");
  };

  return {
    fullHtml,
    createFullHtml,
  };
};

export default useCreateComponent;