import { useState, useEffect } from "react";
import HoverElement from "./components/hover-element";
import SelectElement from "./components/select-element";
import { TAB_PLUGIN_ACTIONS } from "@/entrypoints/common/constant/events";
import { useCreateComponent } from "./hooks";
import {
  openFullHtmlNewTab,
  downloadBlob,
  sendBrowserMessage,
  doLog,
} from "./utils";
import { codeEditState } from "./storage";
import "./app.css";

const App = () => {
  const [start, setStart] = useState(false);
  const [element, setElement] = useState<null | HTMLElement>(null);
  const { cssStr, htmlStr, fullHtml, createFullHtml } = useCreateComponent();

  useEffect(() => {
    doLog("插件组件开启");
  }, []);

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
    el && createFullHtml(el);
    setStart(false);
  };

  useEffect(() => {
    htmlStr && setCache();
  }, [htmlStr]);

  const setCache = async () => {
    await codeEditState.setCodeState({
      css: cssStr,
      html: htmlStr ? htmlStr.outerHTML : "",
    });

    setTimeout(() => {
      sendBrowserMessage({
        msgType: "openEditCodePage",
        data: {},
      });
    }, 100);
  };

  browser.runtime.onMessage.addListener((message) => {
    const { type } = message;
    switch (type) {
      case "PluginStageChange":
        doLog(start ? "插件关闭" : "插件开启");
        setStart(!start);
        break;
    }
  });

  // const openEditCodePage = async () => {
  //   const res= await codeEditState.getCodeState()
  //   console.log(123,res);

  // };

  return (
    <div className="app-wrap">
      {start && <HoverElement onChange={selectChange} />}

      {/* <div
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
      </div> */}

      {/* {start ? (
        <HoverElement onChange={selectChange} />
      ) : (
        <SelectElement el={element} />
      )} */}
    </div>
  );
};

export default App;
