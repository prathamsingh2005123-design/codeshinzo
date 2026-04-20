// Filename: Frontend/src/components/CodeEditor.jsx


import Editor from "@monaco-editor/react";

function CodeEditor() {
  return (
    <div className="h-full flex flex-col">

      {/* Language Selector */}
      <div className="flex gap-2 p-2 border-b border-base-300">

        <button className="btn btn-sm btn-primary">
          JavaScript
        </button>

        <button className="btn btn-sm btn-ghost">
          Java
        </button>

        <button className="btn btn-sm btn-ghost">
          C++
        </button>

      </div>

      {/* Editor */}
      <div className="flex-1">
        <Editor
          height="100%"
          theme="vs-dark"
          defaultLanguage="javascript"
          defaultValue="// write your code here"
        />
      </div>

      {/* Run Button */}
      <div className="p-3 border-t border-base-300 flex justify-end">

        <button className="btn btn-success btn-sm">
          Run Code
        </button>

      </div>

    </div>
  );
}

export default CodeEditor;