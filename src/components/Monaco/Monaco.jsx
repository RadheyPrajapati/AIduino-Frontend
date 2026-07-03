import React from "react";
import Editor from "@monaco-editor/react";
import { useSelector, useDispatch } from 'react-redux';
import { changeCode } from "../../../Redux/codeSlice";

export default function Monaco() {

  const code = useSelector((state) => state.code.value);
  const dispatch = useDispatch();
//   const [code, setCode] = useState(`// Write your Arduino code here
// void setup() {
//   Serial.begin(9600);
// }

// void loop() {
//   Serial.println("Hello Arduino");
//   delay(1000);
// }`);

  const vscodeDarkTheme = {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: "6A9955" },
      { token: "keyword", foreground: "569CD6" },
      { token: "number", foreground: "B5CEA8" },
      { token: "string", foreground: "CE9178" },
      { token: "type", foreground: "4EC9B0" },
      { token: "function", foreground: "DCDCAA" },
      { token: "variable", foreground: "9CDCFE" },
    ],
    colors: {
      "editor.background": "#1E1E1E",
      "editor.foreground": "#D4D4D4",
    },
  };

  return (
    <Editor
      height="100%"
      language="cpp"
      theme="vscode-dark"
      value={code}
      onChange={(value) => dispatch(changeCode(value))}
      beforeMount={(monaco) => {
        monaco.editor.defineTheme("vscode-dark", vscodeDarkTheme);
      }}
      options={{
        minimap: { enabled: false },
        fontSize: 16,
        fontFamily: "Fira Code, Consolas, monospace",
        fontLigatures: true,
        lineHeight: 25,
        wordWrap: "on",
        automaticLayout: true,
      }}
    />
  );
}
