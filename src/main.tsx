import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import App from "./App.tsx";
import "./index.css";

// Auto atualizar o service worker
registerSW({ immediate: true });

createRoot(document.getElementById("root")!).render(<App />);
