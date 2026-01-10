import pool from "../config/db.js";
import { compareHash } from "../utils/hash.js";

export const KEY_LIMIT = 100;

export async function apiKeyAuth(req, res, next) {
  try {
    const rawKey = req.headers["x-api-key"];
    if (!rawKey) {
      return res.status(401).json({ error: "Missing x-api-key header" });
    }

    const rawKeyClean = String(rawKey).trim();

    const [rows] = await pool.query(
      "SELECT id, key_hash FROM api_keys WHERE status = 'active'"
    );

    for (const row of rows) {
      const ok = await compareHash(rawKeyClean, row.key_hash);
      if (!ok) continue;

      // hitung pemakaian TOTAL
      const [[usage]] = await pool.query(
        `SELECT COUNT(*) AS used_total FROM usage_logs WHERE api_key_id = ?`,
        [row.id]
      );

      const usedTotal = Number(usage?.used_total || 0);

      // kalau limit habis, stop (pakai 402 biar “harus langganan”)
      if (usedTotal >= KEY_LIMIT) {
        return res.status(402).json({
          error: "Kuota API key sudah habis. Untuk lanjut, silakan upgrade/berlangganan.",
          limit_total: KEY_LIMIT,
          used_total: usedTotal,
          remaining_total: 0
        });
      }

      // ✅ kalau endpoint quota, jangan mengurangi kuota
      const isQuotaEndpoint = req.originalUrl?.includes("/api/v1/currency/quota");

      // ✅ log pemakaian SEKARANG (agar kuota langsung akurat), kecuali endpoint quota
      if (!isQuotaEndpoint) {
        await pool.query(
          `INSERT INTO usage_logs (api_key_id, endpoint, method, status_code)
           VALUES (?, ?, ?, ?)`,
          [row.id, req.originalUrl || req.path, req.method, 200]
        );
      }

      // update last_used_at
      await pool.query(
        "UPDATE api_keys SET last_used_at = NOW() WHERE id = ?",
        [row.id]
      );

      // pasang info ke req
      const newUsed = isQuotaEndpoint ? usedTotal : usedTotal + 1;
      req.apiKey = {
        id: row.id,
        used_total: newUsed,
        remaining_total: Math.max(0, KEY_LIMIT - newUsed),
        limit_total: KEY_LIMIT
      };

      return next();
    }

    return res.status(401).json({ error: "Invalid or revoked API key" });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error", detail: err.message });
  }
}
