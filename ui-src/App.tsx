import React from "react";
import "./App.css";

function App() {
  const onCalculate = () => {
    parent.postMessage({ pluginMessage: { type: "calculate-variables" } }, "*");
  };
  const onRender = () => {
    parent.postMessage({ pluginMessage: { type: "render-variables" } }, "*");
  };

  return (
    <main>
      <header>
        <h2>Figma Variable Macros</h2>
      </header>
      <footer>
        <button className="brand" onClick={onCalculate}>
          Calculate
        </button>
        <button className="brand" onClick={onRender}>
          Printf
        </button>
      </footer>
    </main>
  );
}

export default App;
