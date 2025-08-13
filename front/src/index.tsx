import React from "react";
import ReactDOM from "react-dom/client";
import ChatView from "@views/ChatSession";
import "../public/css/tailwind.css";

console.log("React is mounting...");

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ChatView />
  </React.StrictMode>
);
