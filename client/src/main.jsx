import React from "react";
import ReactDOM from "react-dom/client";
import "../node_modules/@fortawesome/fontawesome-free/css/all.css";
import "../node_modules/font-awesome/css/font-awesome.min.css";
import "../node_modules/elegant-icons/style.css";
import "../node_modules/et-line/style.css";
import "../node_modules/bootstrap/dist/js/bootstrap.bundle.min.js";
import "./assets/bootstrap.min.css";
import "./assets/aos.css";
import "./assets/animated.css";
import "./assets/swiper-bundle.min.css";
import "./assets/coloring.css";
import "./assets/globals.css";
import "./assets/Home.module.css";
import "./assets/maincolor.css";
import "./assets/style.scss";
import App from "./app.jsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <QueryClientProvider client={new QueryClient()}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);
