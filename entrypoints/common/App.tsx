import { useState, useEffect } from "react";
import HoverElement from "./components/hover-element";
import SelectElement from "./components/select-element";
import { useCreateComponent } from "./hooks";
import { openFullHtmlNewTab, downloadBlob, sendBrowserMessage } from "./utils";
import "./app.css";

const App = () => {
  const [start, setStart] = useState(false);
  const [element, setElement] = useState<null | HTMLElement>(null);
  const { fullHtml, createFullHtml } = useCreateComponent();

  const startSelectCom = () => {
    setStart(true);
  };

  const previewCom = () => {
    openFullHtmlNewTab(fullHtml);
  };

  const downloadCom = () => {
    downloadBlob(fullHtml);
  };

  const selectChange = (el: HTMLElement) => {
    setElement(el);
    setStart(false);

    el && createFullHtml(el);
  };

  const openEditCodePage = () => {
    sendBrowserMessage({
      msgType: "openEditCodePage",
      data: {},
    });
  };

  return (
    <div className="app-wrap">
      <div
        className="app-wrap-select"
        style={{
          display: !start ? "flex" : "none",
        }}
      >
        <button className="primary" onClick={startSelectCom}>
          选择
        </button>
        <button className="primary" onClick={previewCom}>
          预览
        </button>
        <button className="primary" onClick={downloadCom}>
          下载
        </button>
        <button className="primary" onClick={openEditCodePage}>
          打开代码编辑器
        </button>
      </div>

      {start ? (
        <HoverElement onChange={selectChange} />
      ) : (
        <SelectElement el={element} />
      )}
    </div>
  );
};

export default App;
