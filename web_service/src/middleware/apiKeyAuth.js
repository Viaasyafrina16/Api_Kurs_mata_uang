import pool from "../config/db.js";
import { compareHash } from "../utils/hash.js";

export async function apiKeyAuth(req, res, next) {
  try {
    const rawKey = req.headers["x-api-key"];

    if (!rawKey) {
      return res.status(401).json({ error: "Missing x-api-key header" });
    }

    // ambil semua key active (simpel dulu)
    const [rows] = await pool.query(
      "SELECT id, key_hash, status FROM api_keys WHERE status = 'active'"
    );

    for (const row of rows) {
      const ok = await compareHash(rawKey, row.key_hash);
      if (ok) {
        // update last_used_at (opsional tapi bagus)
        await pool.query("UPDATE api_keys SET last_used_at = NOW() WHERE id = ?", [row.id]);

        req.apiKey = { id: row.id };
        return next();
      }
    }

    return res.status(401).json({ error: "Invalid or revoked API key" });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error", detail: err.message });
  }
}
