import React, { useState, useRef } from "react";
import { Layout, Button, Input } from "antd";
import { useClickAway } from "ahooks";
import { EditOutlined } from "@ant-design/icons";
import "./style.css";

interface Props {
  copyCode: () => void;
  refreshPreview: () => void;
}

const Header: React.FC<Props> = (prop) => {
  const { copyCode, refreshPreview } = prop;

  const [bool, setBool] = useState(false);
  const [name, setName] = useState("无名称组件");
  const nameInput = useRef<HTMLDivElement>(null);

  useClickAway(() => {
    setBool(false);
    if (!name.trim()) {
      setName("无名称组件");
    }
  }, nameInput);

  const handleEditName = (e:React.MouseEvent) => {
    // 阻止事件冒泡
    e.stopPropagation();
    if (name === "无名称组件") setName("");
    setBool(true);
  };

  return (
    <Layout.Header className="header-content">
      <div className="left">
        <div className="com-name" ref={nameInput}>
          {bool ? (
            <Input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
              }}
              autoFocus
            />
          ) : (
            <div className="text-display" onClick={handleEditName}>
              <span>{name}</span>
              <EditOutlined
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditName(e);
                }}
              />
            </div>
          )}
        </div>
      </div>
      <div className="right">
        <Button
          type="primary"
          onClick={() => {
            copyCode && copyCode();
          }}
        >
          复制完整代码
        </Button>
        <Button
          onClick={() => {
            refreshPreview && refreshPreview();
          }}
        >
          刷新代码预览页面
        </Button>
      </div>
    </Layout.Header>
  );
};
export default Header;
