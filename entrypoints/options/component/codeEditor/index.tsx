import React, { useEffect, useRef, useCallback } from "react";
import { basicSetup } from "codemirror";
import { EditorView, keymap } from "@codemirror/view";
import { indentWithTab } from "@codemirror/commands";
import { EditorState } from "@codemirror/state";
import { css } from "@codemirror/lang-css"; // 引入语言包
import { html } from "@codemirror/lang-html"; // 引入语言包
import { javascript } from "@codemirror/lang-javascript"; // 引入语言包

import {
  HtmlSvgIcon,
  JsSvgIcon,
  CssSvgIcon,
} from "~/entrypoints/options/icon/CustomIcon";

import { boysAndGirls } from "thememirror";

import type { codeValueType } from "~/entrypoints/options/type";

import "./style.css";

interface Props {
  language: "css" | "html" | "javascript";
  code: string;
  onChange: (value: codeValueType) => void;
}

const lang = {
  css: () => css(),
  html: () => html(),
  javascript: () => javascript(),
};

const icon = {
  css: <CssSvgIcon/>,
  html: <HtmlSvgIcon/>,
  javascript: <JsSvgIcon/>,
};

const backgroundColor = "#000205";

const CodeEditor: React.FC<Props> = ({ language, code, onChange }) => {
  const editorRef = useRef(null);
  const editView = useRef<EditorView | null>(null);


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

  // @TODO 代码格式化
  const formatCode = async () => {
    if (!editView.current) return;

    const code = editView.current.state.doc.toString();
    let formattedCode = "";

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
          <span style={{marginLeft:6}}>{language.toUpperCase()}</span>
        </div>
        <div className="action">
          <div className="format-code" onClick={formatCode}>
            一键格式化
          </div>
        </div>
      </div>
      <div
        style={{
          backgroundColor: backgroundColor,
          height: "100%",
        }}
        ref={editorRef}
      ></div>
    </div>
  );
};

export default React.memo(CodeEditor);
