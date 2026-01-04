import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import pool from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import keyRoutes from "./routes/key.routes.js";
import currencyRoutes from "./routes/currency.routes.js";
import adminRoutes from "./routes/admin.routes.js";





const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/auth", authRoutes);
app.use("/keys", keyRoutes);
app.use("/admin", adminRoutes);
app.use("/api/v1/currency", currencyRoutes);






app.get("/db-test", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT COUNT(*) AS total_users FROM users");
    res.json({
      message: "Database connected",
      result: rows[0]
    });
  } catch (err) {
    res.status(500).json({
      error: "Database connection failed",
      detail: err.message
    });
  }
});

export default app;
