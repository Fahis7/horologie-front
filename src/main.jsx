import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import Authprovider from "./common/context/Authprovider.jsx";
import { GoogleOAuthProvider } from "@react-oauth/google";


createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
    <Authprovider>
      <GoogleOAuthProvider clientId="215236458078-1damlci915bl1sv0dr05jdor5hsg05s4.apps.googleusercontent.com">
      <App />
      </GoogleOAuthProvider>
      </Authprovider>
    </BrowserRouter>
  </StrictMode>
);
