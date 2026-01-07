import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3000";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// serve static assets
app.use("/assets", express.static(path.join(__dirname, "assets")));

// inject BACKEND_URL ke html (simple template)
function sendPage(res, fileName) {
  const filePath = path.join(__dirname, "pages", fileName);
  res.sendFile(filePath);
}

app.get("/", (req, res) => sendPage(res, "index.html"));
app.get("/login", (req, res) => sendPage(res, "login.html"));
app.get("/dashboard", (req, res) => sendPage(res, "dashboard.html"));
app.get("/admin", (req, res) => sendPage(res, "admin.html"));
app.get("/docs", (req, res) => sendPage(res, "docs.html"));
app.get("/signup", (req, res) => sendPage(res, "signup.html"));
app.get("/explorer", (req, res) => sendPage(res, "explorer.html"));




// endpoint kecil untuk expose backend url ke JS
app.get("/config", (req, res) => {
  res.json({ backendUrl: BACKEND_URL });
});
app.get("/admin-rates", (req, res) => {
  res.sendFile(path.join(__dirname, "pages", "admin-rates.html"));
});

app.listen(PORT, () => {
  console.log(`Client Web running on http://localhost:${PORT}`);
});
