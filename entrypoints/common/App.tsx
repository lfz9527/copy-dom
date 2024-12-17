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
      setSelect(true);
    } else if (ClickDir === CLICK_DIR[2]) {
      createFullHtml(el);
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
        const msg = !remove ? "插件关闭" : "插件开启";
        doLog(msg);
        setRemove(!remove);
        setHover(true);
        setSelect(false);
        break;
    }
  });

  const selectParent = () => {
    setElement((currentElement) => {
      if (!currentElement) {
        antMessage.error("没有选中的节点");
        return currentElement;
      }

      const parent = currentElement.parentElement;

      if (!parent) {
        antMessage.error("当前节点没有父级节点");
        return currentElement;
      }

      if (parent.tagName === "BODY") {
        antMessage.error("父节点已经是body了");
        return currentElement;
      }

      return parent;
    });
  };

  return (
    <div className="app-wrap">
      {!remove && (
        <>
          {hover && <HoverElement onChange={selectChange} />}

          {!hover && select && (
            <SelectElement
              el={element}
              resSelect={()=>{
                setHover(true);
                setSelect(false);
              }}
              selectParent={selectParent}
              onChange={(curEl) => {
                createFullHtml(curEl);
              }}
            />
          )}
        </>
      )}
    </div>
  );
};

export default App;
