import React, { useEffect, useRef, useCallback } from "react";
import { basicSetup } from "codemirror";
import { EditorView, keymap } from "@codemirror/view";
import { indentWithTab } from "@codemirror/commands";
import { EditorState } from "@codemirror/state";
import { css } from "@codemirror/lang-css"; // 引入语言包
import { html } from "@codemirror/lang-html"; // 引入语言包
import { javascript } from "@codemirror/lang-javascript"; // 引入语言包
import beautify from "js-beautify";

import {
  HtmlSvgIcon,
  JsSvgIcon,
  CssSvgIcon,
} from "~/entrypoints/options/icon/CustomIcon";

import { Popover, InputNumber } from "antd";
import type { InputNumberProps } from 'antd';

import { SettingOutlined } from "@ant-design/icons";

import { boysAndGirls } from "thememirror";

import type { codeValueType } from "~/entrypoints/options/type";

import "./style.css";

interface Props {
  language: "css" | "html" | "javascript";
  code: codeValueType;
  onChange: (value: codeValueType) => void;
}

const lang = {
  css: () => css(),
  html: () => html(),
  javascript: () => javascript(),
};

// 定义通用规则和特定语言规则
const generalRules = {
  indent_size: 2,
};

const formatRule = {
  css: {
    ...generalRules,
  },
  html: {
    ...generalRules,
    wrap_line_length: 80,
    unformatted: ["code", "pre"],
  },
  javascript: {
    ...generalRules,
    space_in_empty_paren: true,
  },
};

const icon = {
  css: <CssSvgIcon />,
  html: <HtmlSvgIcon />,
  javascript: <JsSvgIcon />,
};

const backgroundColor = "#000205";

const CodeEditor: React.FC<Props> = ({ language, code, onChange }) => {
  const editorRef = useRef(null);
  const editView = useRef<EditorView | null>(null);
  const insertCode = useRef(false);
  const [editFontSize, setEditFontSize] = useState(12);

  const fontSizeChange: InputNumberProps['onChange'] = (value) => {
    setEditFontSize(Number(value))
  };

  const settingContent = (
    <div>
      <div
        className="setting-item"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <label style={{ flexShrink: 0 }}>字体大小</label>
        <InputNumber
          min={10}
          style={{
            width: 64,
          }}
          defaultValue={editFontSize}
          onChange={fontSizeChange}
        />
      </div>
    </div>
  );

  useEffect(() => {
    // 初始化CodeMirror编辑器
    const state = EditorState.create({
      doc: code,
      extensions: [
        basicSetup,
        boysAndGirls,
        lang[language](),
        keymap.of([indentWithTab]), // 添加这行
        EditorView.lineWrapping, // 启用自动换行
        EditorView.updateListener.of((v) => {
          onChange(v.state.doc.toString()); //监测得到的最新代码
        }),
        // 主题样式设置
        EditorView.theme({
          ".cm-cursor": {
            // 添加这个配置
            borderLeftColor: "#fff", // 设置光标颜色
            borderLeftWidth: "2px", // 可选：设置光标宽度
          },
          ".cm-editor": {
            backgroundColor: backgroundColor,
          },
        }),
      ],
    });
    const view = new EditorView({
      state,
      parent: editorRef.current!,
    });
    editView.current = view;
    return () => {
      view.destroy(); // 注意：此后此处要随组件销毁
    };
  }, []);

  useEffect(() => {
    if (!insertCode.current && code) {
      editView.current?.dispatch({
        changes: {
          from: 0,
          to: editView.current.state.doc.length,
          insert: code,
        },
      });
      insertCode.current = true;
    }
  }, [code]);

  const updateCodeText = (newCode: string | undefined) => {
    if (!editView.current) return;
    // 保存当前光标位置
    const selection = editView.current.state.selection;

    editView.current.dispatch({
      changes: {
        from: 0,
        to: editView.current.state.doc.length,
        insert: newCode,
      },
      // 保持原有的选择状态
      selection: selection,
    });
  };

  // @TODO 代码格式化
  const formatCode = async () => {
    if (!editView.current) return;

    const code = editView.current.state.doc.toString();

    const formatFn = {
      html: beautify.html,
      css: beautify.css,
      javascript: beautify.js,
    };

    const formattedCode = formatFn[language](code, formatRule[language]);
    updateCodeText(formattedCode);

    try {
      // onChange(formattedCode);
    } catch (error) {
      console.error("Format failed:", error);
    }
  };

  return (
    <div className="code-content">
      <div className="code-header">
        <div className="code-header-tab">
          {icon[language]}
          <span style={{ marginLeft: 6 }}>{language.toUpperCase()}</span>
        </div>
        <div className="action">
          <div className="format-code action-item" onClick={formatCode}>
            一键格式化
          </div>
          <Popover
            placement="topRight"
            trigger="click"
            content={settingContent}
          >
            <SettingOutlined className="action-item" onClick={() => {}} />
          </Popover>
        </div>
      </div>
      <div
        className="code-editor"
        style={{
          backgroundColor: backgroundColor,
          height: "100%",
          overflowY: "auto",
          fontSize: editFontSize,
        }}
        ref={editorRef}
      ></div>
    </div>
  );
};

export default React.memo(CodeEditor);
