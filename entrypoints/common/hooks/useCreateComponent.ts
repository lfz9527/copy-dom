import { useState } from "react";
import { doLog } from "../utils";
import {
  PSEUDO_CONFIG,
  STYLE_WHITELIST,
  DEFAULT_STYLES,
  INHERITED_PROPERTIES,
  PROPERTY_DEPENDENCIES,
  ELEMENT_ATTRIBUTES,
  TAG_DEFAULT_STYLES,
} from "../config";
import type {
  StyleNode,
  ElAttrCategoryKeys,
  ElAttrCategory,
  ElTagKeys,
  HTMLTags,
} from "../config/type";
import { CLASS_PREFIX, DATA_CLASS_ID, RESET_CSS, NodeTypes } from "../constant";
import { message } from "antd";

interface MergedStyle {
  selectors: string[];
  rules: Map<string, StyleNode["styles"]["rules"][0]>;
}

type singleStyleType = [string, MergedStyle][];

let elementData = new WeakMap<HTMLElement, string>();
let index = -1;

const useCreateComponent = () => {
  const [fullHtml, setFullHtml] = useState("");
  const [cssStr, setCss] = useState("");
  const [htmlStr, setHtmlStr] = useState<HTMLElement | null>(null);

  // 生成唯一的 classId 的表示
  const generateDataClassId = (el: HTMLElement): string => {
    const classId = elementData.get(el);
    if (classId) return classId;

    index++;

    const dataClassId = `${el.tagName}${index}`;

    elementData.set(el, dataClassId);

    return dataClassId;
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
          // 跳过 style、script 和 noscript 标签
          if (
            !(child instanceof HTMLStyleElement) &&
            !(child instanceof HTMLScriptElement) &&
            !((child as HTMLElement).tagName.toLowerCase() === "noscript")
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
  const collectStyleTree = (el: HTMLElement): Promise<StyleNode> => {
    return new Promise((resolve) => {
      const queue: HTMLElement[] = [el];
      const batchSize = 50;
      const styleNodes = new Map<HTMLElement, StyleNode>();
      let rootNode: StyleNode;

      const processElement = (element: HTMLElement): StyleNode => {
        const rules = resolveStyleContent(element);
        const dataClassId = generateDataClassId(element);
        element.setAttribute(DATA_CLASS_ID, dataClassId);

        return {
          type: "Element",
          tagName: element.tagName.toLowerCase(),
          [DATA_CLASS_ID]: dataClassId!,
          styles: {
            type: "StyleSheet",
            rules,
          },
          children: [],
        };
      };

      const processBatch = () => {
        const currentBatch = queue.splice(0, batchSize);

        currentBatch.forEach((element) => {
          const node = processElement(element);
          styleNodes.set(element, node);

          // 保存根节点引用
          if (element === el) {
            rootNode = node;
          }

          Array.from(element.children)
            .filter(
              (child): child is HTMLElement => child instanceof HTMLElement
            )
            .forEach((child) => queue.push(child));
        });

        if (queue.length > 0) {
          // 使用 setTimeout 代替 requestIdleCallback 以确保更快的执行
          setTimeout(processBatch, 0);
        } else {
          buildTree();
          resolve(rootNode);
        }
      };

      const buildTree = () => {
        styleNodes.forEach((node, element) => {
          const parent = element.parentElement;
          if (parent && styleNodes.has(parent)) {
            const parentNode = styleNodes.get(parent)!;
            parentNode.children.push(node);
          }
        });
      };

      processBatch();
    });
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

  // 处理宽高值，向上取整
  const formatDimension = (property: string, value: string) => {
    if (property === "width" || property === "height") {
      // 提取数值和单位
      const match = value.match(/^([\d.]+)(.*)$/);
      if (match) {
        const [, num, unit] = match;
        // 向上取整
        return `${Math.ceil(parseFloat(num))}${unit}`;
      }
    }
    return value;
  };

  // 处理获得的构造函数
  const resolveStyleContent = (el: HTMLElement) => {
    let rules: StyleNode["styles"]["rules"] = [];

    const tagName = el.tagName.toLowerCase() as HTMLTags;

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
            value: formatDimension(key, value),
            important: computedStyle.getPropertyPriority(key) === "important",
          });
        }
      } else {
        rules.push({
          type: "Rule",
          property: key,
          value: formatDimension(key, value),
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

    // 过滤掉一些标签的默认值
    const filterTagDefaultStyles = (
      rules: StyleNode["styles"]["rules"]
    ): StyleNode["styles"]["rules"] => {
      return rules.filter(
        (rule) =>
          rule.value !== (TAG_DEFAULT_STYLES[tagName]?.[rule.property] ?? "")
      );
    };

    // 收集伪类和伪元素样式
    const pseudoRules = resolvePseudoStyle(el);

    rules = [...rules, ...pseudoRules];

    // 前面进行过滤时 可能也会产生默认值，所以最后再处理默认值
    const realRules = filterTagDefaultStyles(
      filterDependentProperties(rules)
    ).filter((rule) => !isDefaultValue(rule.property, rule.value));
    return realRules;
  };

  // 使用属性值-属性名生成类名
  const generatePropertyClassName = (property: string, value: string) => {
    // 处理特殊字符
    const cleanValue = value
      .trim()
      // 将百分比符号替换为 'percent'
      .replace(/%/g, "-percent")
      // 替换特殊字符为连字符
      .replace(/[!@#$%^&*()+=\[\]{}'";:<>?~,./\\]/g, "-")
      // 替换空格为连字符
      .replace(/\s+/g, "-")
      // 移除连续的连字符
      .replace(/-+/g, "-")
      .toLowerCase();

    return `${property}-${cleanValue}`;
  };

  // CSS生成逻辑
  const generateCssUpdate = (node: StyleNode) => {
    let css = "";
    // 按层级分组节点
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


    // 用于最终合并的样式映
    const finalStyles = new Map<string, MergedStyle>();

    //处理伪类/伪元素的样式映射
    interface PseudoStyle {
      pseudo: string;
      rules: Map<string, StyleNode["styles"]["rules"][0]>;
    }
    const pseudoStyles = new Map<string, PseudoStyle[]>();

    // 按层级处理
    levelMap.forEach((nodes) => {
      interface StyleInfo {
        selector: string;
        rules: Map<string, StyleNode["styles"]["rules"][0]>;
      }
      const levelStyles: StyleInfo[] = [];

      // 收集当前层级所有节点的样式
      nodes.forEach((node) => {
        const styleInfo: StyleInfo = {
          selector: `.${node[DATA_CLASS_ID]}`,
          rules: new Map(),
        };

        node.styles.rules.forEach((rule) => {
          const selector = `.${node[DATA_CLASS_ID]}`;

          if (!rule.pseudo) {
            styleInfo.rules.set(rule.property, rule);
          } else {
            const key = `${selector}${rule.pseudo}`;
            if (!pseudoStyles.has(key)) {
              pseudoStyles.set(key, [
                {
                  pseudo: rule.pseudo,
                  rules: new Map(),
                },
              ]);
            }
            const pseudoGroup = pseudoStyles.get(key)![0];
            pseudoGroup.rules.set(rule.property, rule);
          }
        });

        levelStyles.push(styleInfo);
      });

      // 在当前层级内按属性值分组
      interface PropertyGroup {
        value: string;
        important: boolean;
        selectors: string[];
      }
      const propertyGroups = new Map<string, Map<string, PropertyGroup>>();

      // 遍历当前层级所有节点的所有属性
      levelStyles.forEach((nodeStyle) => {
        nodeStyle.rules.forEach((rule) => {
          const valueKey = `${rule.value}${rule.important ? "!important" : ""}`;

          if (!propertyGroups.has(rule.property)) {
            propertyGroups.set(rule.property, new Map());
          }

          const propGroup = propertyGroups.get(rule.property)!;
          if (!propGroup.has(valueKey)) {
            propGroup.set(valueKey, {
              value: rule.value,
              important: rule.important,
              selectors: [],
            });
          }

          propGroup.get(valueKey)!.selectors.push(nodeStyle.selector);
        });
      });

      // 首先生成共同属性的CSS
      propertyGroups.forEach((valueGroups, property) => {
        valueGroups.forEach((group) => {
          if (group.selectors.length > 1) {
            const selectorsKey = group.selectors.sort().join(", ");

            if (!finalStyles.has(selectorsKey)) {
              finalStyles.set(selectorsKey, {
                selectors: group.selectors,
                rules: new Map(),
              });
            }

            finalStyles.get(selectorsKey)!.rules.set(property, {
              type: "Rule",
              property,
              value: group.value,
              important: group.important,
            });

            // 从各个节点的规则中移除已处理的属性
            group.selectors.forEach((selector) => {
              const nodeStyle = levelStyles.find(
                (ns) => ns.selector === selector
              );
              if (nodeStyle) {
                nodeStyle.rules.delete(property);
              }
            });
          }
        });
      });

      // 处理剩余的独特属性
      levelStyles.forEach((nodeStyle) => {
        if (nodeStyle.rules.size > 0) {
          const selectorKey = nodeStyle.selector;

          if (!finalStyles.has(selectorKey)) {
            finalStyles.set(selectorKey, {
              selectors: [nodeStyle.selector],
              rules: new Map(),
            });
          }
          nodeStyle.rules.forEach((rule) => {
            finalStyles.get(selectorKey)!.rules.set(rule.property, rule);
          });
        }
      });
    });


    //  这里对样式只有一个属性的进行处理
    finalStyles.forEach((style) => {
      const rules = Array.from(style.rules.values());
      if (rules.length === 1) {
        const property = rules.map(
          (rule) =>
            `.${generatePropertyClassName(rule.property, rule.value)}${
              rule.important ? "-important" : ""
            }`
        );
        // 如果只有一个属性，则使用 属性名-属性值 作为选择器
        style.selectors = property.map((m) => m.trim().toLowerCase());
      }
    });

    // 生成最终的CSS
    finalStyles.forEach((style) => {
      const selector = style.selectors
        .map((s) => `.${CLASS_PREFIX} ${s}`)
        .join(", ");
      const rules = Array.from(style.rules.values())
        .map(
          (rule) =>
            `  ${rule.property}: ${rule.value}${
              rule.important ? " !important" : ""
            };`
        )
        .join("\n");

      if (rules) {
        css += `${selector} {\n${rules}\n}\n\n`;
      }
    });

    // 生成伪类/伪元素的CSS
    pseudoStyles.forEach((pseudoGroup, selector) => {
      pseudoGroup.forEach((group) => {
        const rules = Array.from(group.rules.values())
          .map(
            (rule) =>
              `  ${rule.property}: ${rule.value}${
                rule.important ? " !important" : ""
              };`
          )
          .join("\n");

        if (rules) {
          // 为伪类/伪元素选择器添加父类前缀
          const selectorWithParent = `.${CLASS_PREFIX} ${selector}`;
          css += `${selectorWithParent} {\n${rules}\n}\n\n`;
        }
      });
    });

    // 获取单一属性的选择器及其样式
    const singleStyle = Array.from(finalStyles).filter(([, style]) => {
      return Array.from(style.rules.values()).length === 1;
    });

    return { cssString: css, singleStyle };
  };

  // 判断单属性 放置在哪个节点上
  const includeStyleMap = (
    dataClassId: string,
    singleStyle: singleStyleType
  ) => {
    const curKey = singleStyle.find(([key]) => {
      return key
        .split(",")
        .map((cl) => cl.replace(".", "").trim())
        .includes(dataClassId);
    });
    if (curKey) {
      const [, style] = curKey;
      return style.selectors.join("");
    }
    return "";
  };

  // 清理并转换HTML元素
  const formatElement = (
    el: HTMLElement,
    singleStyle: singleStyleType
  ): HTMLElement => {
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
      const classes = includeStyleMap(dataClassId!, singleStyle).replace(
        ".",
        ""
      );

      // 将原有的 dataClassId 和新的样式类名组合
      const classNames = [dataClassId, classes].filter(Boolean).join(" ");
      el.className = classNames;
    }

    // 递归处理子元素
    Array.from(el.children).forEach((child) => {
      if (child instanceof HTMLElement) {
        formatElement(child, singleStyle);
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

  // 修改 createFullHtml 函数以使用异步 collectStyleTree
  const createFullHtml = async (el: HTMLElement) => {
    doLog("正在生成组件....");

    message.open({
      type: "loading",
      content: "正在生成组件",
      duration: 0,
    });
    // 使用 setTimeout 让 message 有时间显示
    await new Promise((resolve) => setTimeout(resolve, 1000));
    el.setAttribute("is_root_dom", "true");
    cleanup();

    // 克隆 dom
    const clonedEl = cloneElement(el);

    // 生成css 树
    const cssTree = await collectStyleTree(el);
    // css 树生成 css 样式表
    const { cssString, singleStyle } = generateCssUpdate(cssTree);
    // 处理dome 结构
    const elements = formatElement(clonedEl, singleStyle);

    // css + dom 结构 生成完整的html 文档
    const fullHtml = generateComponentTree({ css: cssString, html: elements });

    setCss(cssString);
    setHtmlStr(elements);
    setFullHtml(fullHtml);
    // console.log("elements", elements);
    // console.log("cssTree", cssTree);
    // console.log("cssString", cssString);

    message.destroy();
    doLog("组件生成完毕！！");
  };

  return {
    cssStr,
    htmlStr,
    fullHtml,
    createFullHtml,
  };
};

export default useCreateComponent;
