// Filename: Frontend/src/components/TestcasePanel.jsx
function TestcasePanel() {
  return (
    <div className="h-full flex flex-col">

      <div className="tabs tabs-boxed p-2">
        <a className="tab tab-active">Testcase</a>
        <a className="tab">Result</a>
      </div>

      <div className="p-4 text-sm">
        <pre>2 3</pre>
      </div>

    </div>
  );
}

export default TestcasePanel;