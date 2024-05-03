// Import Necessary Components
import React from "react";
import ReactDom from "react-dom";
import App from "./App";
import { BrowserRouter } from "react-router-dom";

// Render the App component inside BrowserRouter
ReactDom.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,

  // Attach the rendered content to the "root" element in the HTML
  document.getElementById("root")
);
