import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { Provider } from "@/components/ui/provider";
import ToastProvider from "./context/ToastContext";
import ToastContainer from "./components/Toast";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
      <ToastProvider>
        <Provider>
          <App />
          <ToastContainer />
        </Provider>
      </ToastProvider>
  </React.StrictMode>
);
