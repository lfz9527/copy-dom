import React from "react";

interface Prop {
  srcDoc: string;
}

const CodePreview: React.FC<Prop> = ({ srcDoc }) => {
  return (
    <>
      {srcDoc && (
        <iframe
          srcDoc={srcDoc}
          style={{
            width: "100%",
            height: "100%",
            borderWidth: 0,
          }}
          title="output"
          sandbox="allow-scripts"
        ></iframe>
      )}
    </>
  );
};
export default React.memo(CodePreview);
