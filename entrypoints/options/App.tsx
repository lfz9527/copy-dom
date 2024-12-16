import { useState, useEffect } from "react";
import { Splitter,message } from "antd";
import Header from "./component/header/index";
import CodeEditor from "./component/codeEditor/index";
import CodePreview from "./component/codePreview/index";
import type { codeValueType } from "./type";
import { globalState, codeEditState } from "~/entrypoints/common/storage";
import copy from 'copy-to-clipboard'

import "./style.css";

const { reset_css = "" } = globalState.getState();

const App = () => {
  const [cssCode, setCssCode] = useState<codeValueType>("");
  const [jsCode, setJsCode] = useState<codeValueType>("");
  const [htmlCode, setHtmlCode] = useState<codeValueType>("");
  const [srcDoc, setSrcDoc] = useState("");

  useEffect(() => {
    getCacheCode();
  }, []);

  const getCacheCode = async () => {
    const { css, html } = await codeEditState.getCodeState();
    setCssCode(css);
    setHtmlCode(html);
  };

  // 代码复制
  const copyCode = () => {
    copy(srcDoc);
    message.success("复制成功");
    console.log("copyCode");
  };
  // 刷新预览
  const refreshPreview = () => {
    handleCode();
  };

  const cssChange = (value: codeValueType) => {
    setCssCode(value);
  };
  const jsChange = (value: codeValueType) => {
    setJsCode(value);
  };
  const htmlChange = (value: codeValueType) => {
    setHtmlCode(value);
  };

  useEffect(() => {
    const timeout = setTimeout(handleCode, 250);
    return () => clearTimeout(timeout);
  }, [htmlCode, cssCode, jsCode]);

  const handleCode = () => {
    setSrcDoc(`
      <html>
        <style>
        ${reset_css}
        ${cssCode}
        </style>
        <body>${htmlCode}</body>
        <script>${jsCode}</script>
      </html>
    `);
  };

  return (
    <div>
      <Header copyCode={copyCode} refreshPreview={refreshPreview} />

      <Splitter
        style={{
          height: "calc(100vh - 64px)",
        }}
      >
        <Splitter.Panel
          style={{
            height: "calc(100vh - 64px)",
          }}
        >
          <Splitter layout="vertical">
            <Splitter.Panel>
              <CodeEditor language="css" code={cssCode} onChange={cssChange} />
            </Splitter.Panel>
            <Splitter.Panel>
              <CodeEditor language="html" code={htmlCode} onChange={htmlChange} />
            </Splitter.Panel>
            {/* <Splitter.Panel>
              <CodeEditor language="javascript" code={jsCode} onChange={jsChange} />
            </Splitter.Panel> */}
          </Splitter>
        </Splitter.Panel>
        <Splitter.Panel
          defaultSize="70%"
          min="20%"
          max="80%"
          style={{
            overflow: "hidden",
          }}
        >
          <CodePreview srcDoc={srcDoc} />
        </Splitter.Panel>
      </Splitter>
    </div>
  );
};
export default App;
