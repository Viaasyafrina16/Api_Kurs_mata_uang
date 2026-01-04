import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: process.env.PORT || 3000,
  db: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || "",
    name: process.env.DB_NAME,
    port: Number(process.env.DB_PORT || 3306)
  },
  jwtSecret: process.env.JWT_SECRET || "supersecretjwtkey"
};
