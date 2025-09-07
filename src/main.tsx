import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { initDB } from "./utils/indexedDB";

void initDB();

createRoot(document.getElementById("root")!).render(<App />);
