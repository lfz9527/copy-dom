// 样式白名单
const STYLE_WHITELIST = [
  // 布局相关
  'display',
  'position',
  'top',
  'right',
  'bottom',
  'left',
  'float',
  'clear',
  'z-index',
  
  // 盒模型
  'width',
  'height',
  'max-width',
  'max-height',
  'min-width',
  'min-height',
  'margin',
  'margin-top',
  'margin-right',
  'margin-bottom',
  'margin-left',
  'padding',
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',
  
  // 边框
  'border',
  'border-width',
  'border-style',
  'border-color',
  'border-radius',
  
  // Flex布局
  'flex',
  'flex-direction',
  'flex-wrap',
  'flex-flow',
  'justify-content',
  'align-items',
  'align-content',
  'gap',
  
  // Grid布局
  'grid',
  'grid-template-columns',
  'grid-template-rows',
  'grid-gap',
  'grid-column',
  'grid-row',
  
  // 文字样式
  'font-family',
  'font-size',
  'font-weight',
  'line-height',
  'color',
  'text-align',
  'text-decoration',
  'text-transform',
  'letter-spacing',
  
  // 背景
  'background',
  'background-color',
  'background-image',
  'background-repeat',
  'background-position',
  'background-size',
  
  // 其他视觉效果
  'opacity',
  'box-shadow',
  'transform',
  'transition',
  'visibility',
  'overflow',
  'cursor'
] as const;

// 样式树类型定义
interface StyleNode {
  type: "Element";
  tagName: string;
  className?: string;
  "data-class-id": string;
  styles: {
    type: "StyleSheet";
    rules: Array<{
      type: "Rule";
      property: string;
      value: string;
      important: boolean;
    }>;
  };
  children: StyleNode[];
}

const CLASS_PREFIX = "JY-SITE-COM";

// 生成唯一的 data-class-id
const generateDataClassId = (el: HTMLElement): string => {
  const random = Math.random().toString(36).substring(2, 8);

  // 收集类名和ID
  const classNames = el.className
    ? el.className.split(" ").filter(Boolean)
    : [];

  // 如果有ID，添加到末尾
  if (el.id) {
    classNames.push(`id_${el.id}`);
  }

  const suffix = classNames.length > 0 ? "_" + classNames.join("_") : "";

  return `${CLASS_PREFIX}${suffix}#${random}_${el.tagName}`;
};

// 克隆元素
const cloneElement = (el: HTMLElement): HTMLElement => {
  const clonedEl = el.cloneNode(true) as HTMLElement;

  // 设置 data-class-id
  const dataClassId = generateDataClassId(el);
  clonedEl.setAttribute("data-class-id", dataClassId);

  Array.from(clonedEl.children).forEach((child) => {
    if (child instanceof HTMLElement) {
      const processedChild = cloneElement(child);
      child.parentNode?.replaceChild(processedChild, child);
    }
  });

  return clonedEl;
};

// 收集样式树
const collectStyleTree = (el: HTMLElement): StyleNode => {
  // 2. 获取计算样式
  const computedStyle = window.getComputedStyle(el)
  const rules = []
  
  // 3. 收集白名单中的样式
  for(const key of STYLE_WHITELIST) {
    const value = computedStyle.getPropertyValue(key).trim()
    if(value && value !== '0px' && value !== 'none' && value !== 'normal' && value !== 'auto') {
      rules.push({
        type: "Rule" as const,
        property: key,
        value: value,
        important: computedStyle.getPropertyPriority(key) === "important"
      })
    }
  }

  // 4. 递归处理子元素
  const children = Array.from(el.children)
    .filter((child): child is HTMLElement => child instanceof HTMLElement)
    .map(child => collectStyleTree(child))

  // 5. 构建并返回节点
  return {
    type: 'Element',
    tagName: el.tagName.toLowerCase(),
    className: el.className || undefined,
    'data-class-id': el.getAttribute("data-class-id")!,
    styles: {
      type: "StyleSheet",
      rules
    },
    children
  }
}

// 主方法
const getStyle = (el: HTMLElement) => {
  const elements = cloneElement(el)
  const tree = collectStyleTree(elements);

  return {
    elements,
    tree,
  };
};


export default getStyle;
