import React from "react";
import { Provider } from "react-redux";
import ReactDOM from "react-dom";
import store from "./store/index.js";
import "./index.css";
import { AuthContextProvider } from "./store/AuthContext";
import { BrowserRouter as Router } from "react-router-dom";
import App from "./App";

ReactDOM.render(
  <Router>
    <Provider store={store}>
      <AuthContextProvider>
        <App />
      </AuthContextProvider>
    </Provider>
  </Router>,
  document.getElementById("root")
);
