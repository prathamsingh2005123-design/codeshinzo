// Filename: Frontend/src/components/ProblemDescription.jsx
function ProblemDescription() {
  return (
    <div className="p-6">

      <div className="tabs tabs-boxed mb-4">
        <a className="tab tab-active">Description</a>
        <a className="tab">Editorial</a>
        <a className="tab">Solutions</a>
        <a className="tab">Submissions</a>
      </div>

      <h1 className="text-2xl font-bold mb-2">
        Add Two Numbers
      </h1>

      <p className="text-gray-400 mb-6">
        Write a program that takes two integers as input and returns their sum.
      </p>

      <div className="bg-base-300 p-4 rounded-lg mb-4">
        <p className="font-semibold">Example 1</p>
        <pre>Input: 2 3</pre>
        <pre>Output: 5</pre>
        <pre>Explanation: 2 + 3 = 5</pre>
      </div>

      <div className="bg-base-300 p-4 rounded-lg">
        <p className="font-semibold">Example 2</p>
        <pre>Input: -1 5</pre>
        <pre>Output: 4</pre>
        <pre>Explanation: -1 + 5 = 4</pre>
      </div>

    </div>
  );
}

export default ProblemDescription;