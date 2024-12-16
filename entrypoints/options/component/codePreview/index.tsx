import React, { useState, useRef, useEffect,useMemo } from "react";

import {
  IpadIcon,
  PcIcon,
  PhoneIcon,
} from "~/entrypoints/options/icon/CustomIcon";
import "./style.css";

interface Prop {
  srcDoc: string;
}

interface screenIframe {
  name: string;
  size: string;
  isActive: boolean;
  icon: React.ReactNode;
}

const CodePreview: React.FC<Prop> = ({ srcDoc }) => {
  const iframe = useRef<HTMLIFrameElement>(null);
  const [screenIframe, setScreenIframe] = useState<Array<screenIframe>>([
    {
      name: "电脑",
      size: "100%",
      isActive: true,
      icon: (
        <PcIcon
          style={{
            fontSize: "24px",
            color: "rgba(255, 255, 255,0)",
          }}
        />
      ),
    },
    {
      name: "平板",
      size: "768px",
      isActive: false,
      icon: (
        <IpadIcon
          style={{
            fontSize: "24px",
            color: "rgba(255, 255, 255,0)",
          }}
        />
      ),
    },
    {
      name: "手机",
      size: "375px",
      isActive: false,
      icon: (
        <PhoneIcon
          style={{
            fontSize: "24px",
            color: "rgba(255, 255, 255,0)",
          }}
        />
      ),
    },
  ]);

  const curIframe = useMemo(() => {
    return screenIframe.find((item) => item.isActive);
  }, [screenIframe]);

  useEffect(() => {
    if (iframe.current) {
      const width = curIframe?.size;
      iframe.current.style.width = width!;
    }
  }, [screenIframe]);

  const url = useMemo(() => {
    const blob = new Blob([srcDoc], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    return url;
  }, [srcDoc]);

  return (
    <>
      <div className="preview-header">
        <div className="preview-header-content">
          {screenIframe.map((item, index) => (
            <div
              onClick={() => {
                setScreenIframe((state) =>
                  state.map((stateIt, stateI) => {
                    return {
                      ...stateIt,
                      isActive: stateI === index,
                    };
                  })
                );
              }}
              key={index}
              className={
                "preview-header-item preview-header-item" +
                (item.isActive ? "-active" : "")
              }
            >
              {item.icon}
            </div>
          ))}
          {/* {curIframe?.size} */}
        </div>
      </div>
      <div className="preview-container">
        <div className="preview-content">
          {srcDoc && (
            <iframe
              id="output-doc"
              ref={iframe}
              // srcDoc={srcDoc}
              src={url}
              style={{
                width: "100%",
                height: "100%",
                borderWidth: 0,
                background: "#fff",
              }}
              title="output"
              sandbox="allow-scripts"
            ></iframe>
          )}
        </div>
      </div>
    </>
  );
};
export default React.memo(CodePreview);
