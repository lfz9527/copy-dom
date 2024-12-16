import { useState, useEffect } from "react";
import HoverElement from "./components/hover-element";
import { CLICK_DIR } from "./constant/index";
import SelectElement from "./components/select-element";
import { useCreateComponent } from "./hooks";
import { ClickAction } from "~/entrypoints/common/type";

import { sendBrowserMessage, doLog } from "./utils";
import { codeEditState } from "./storage";
import "./app.css";
import { message as antMessage } from "antd";

const App = () => {
  const [remove, setRemove] = useState(true);
  const [hover, setHover] = useState(false);
  const [select, setSelect] = useState(false);
  const [element, setElement] = useState<null | HTMLElement>(null);
  const { cssStr, htmlStr, fullHtml, createFullHtml } = useCreateComponent();

  useEffect(() => {
    doLog("插件组件开启");
  }, []);

  const selectChange = (ClickDir: ClickAction, el: HTMLElement) => {
    setElement(el);
    if (ClickDir === CLICK_DIR[0]) {
      createFullHtml(el);
    } else if (ClickDir === CLICK_DIR[2]) {
      setSelect(true);
    }
    setHover(false);
  };

  useEffect(() => {
    htmlStr && toCodeEdit();
  }, [htmlStr]);

  const uninstall = () => {
    !remove && setRemove(true);
  };

  // 去代码编辑器编辑
  const toCodeEdit = async () => {
    await codeEditState.setCodeState({
      css: cssStr,
      html: htmlStr ? htmlStr.outerHTML : "",
    });

    setTimeout(() => {
      uninstall();
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
        const msg = !remove ? "插件关闭" : "插件开启"
        doLog(msg);
        setRemove(!remove);
        setHover(true);
        break;
    }
  });

  const selectParent = () => {
    if (element) {
      const parent = element.parentElement;
      parent && createFullHtml(parent);
      if (parent) antMessage.error("当前节点没有父级节点");
    }
  };

  return (
    <div className="app-wrap">
      {!remove && (
        <>
          {hover && <HoverElement onChange={selectChange} />}

          {!hover && select && (
            <SelectElement
              el={element}
              selectParent={selectParent}
              selectCurrent={() => {
                element && createFullHtml(element);
              }}
              resSelect={() => {
                setElement(null);
                setSelect(false);
                setHover(true);
              }}
            />
          )}
        </>
      )}
    </div>
  );
};

export default App;
