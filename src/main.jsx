import React from "react";
import { createRoot } from "react-dom/client";
import PortfolioApp from "./pages/PortfolioApp.jsx";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <PortfolioApp />
  </React.StrictMode>,
);
