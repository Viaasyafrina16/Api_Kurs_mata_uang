import pool from "../config/db.js";
import { generateApiKey } from "../utils/apiKey.js";
import { hashValue } from "../utils/hash.js";
import { createApiKey, listApiKeysByUser, revokeApiKey } from "../models/apiKey.model.js";

const KEY_LIMIT = 100;       // kuota total free
const MAX_ACTIVE_KEYS = 1;   // max 1 api key aktif untuk free

// POST /keys (JWT)
export async function createKey(req, res) {
  try {
    const userId = req.user.userId;
    const { label } = req.body || {};

    // 1) cek active key (free hanya boleh 1 aktif)
    const [[activeRow]] = await pool.query(
      "SELECT COUNT(*) AS active_count FROM api_keys WHERE user_id = ? AND status = 'active'",
      [userId]
    );

    if (Number(activeRow.active_count) >= MAX_ACTIVE_KEYS) {
      return res.status(403).json({
        error: "Free plan hanya boleh punya 1 API key aktif. Silakan revoke key lama atau upgrade."
      });
    }

    // 2) cek apakah user sudah habiskan kuota total (akumulasi semua key)
    const [[usageRow]] = await pool.query(
      `
      SELECT COUNT(*) AS used_total
      FROM usage_logs
      WHERE api_key_id IN (SELECT id FROM api_keys WHERE user_id = ?)
      `,
      [userId]
    );

    const usedTotal = Number(usageRow.used_total || 0);

    if (usedTotal >= KEY_LIMIT) {
      return res.status(402).json({
        error: "Kuota free plan sudah habis (100 request). Untuk lanjut, silakan upgrade/berlangganan.",
        limit_total: KEY_LIMIT,
        used_total: usedTotal
      });
    }

    // 3) buat key baru
    const { raw, prefix } = generateApiKey();
    const keyHash = await hashValue(raw);

    const id = await createApiKey({
      userId,
      keyHash,
      keyPrefix: prefix,
      label: label || null
    });

    return res.status(201).json({
      id,
      api_key: raw,
      prefix,
      label: label || null
    });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error", detail: err.message });
  }
}

// GET /keys (JWT)
export async function listKeys(req, res) {
  try {
    const userId = req.user.userId;
    const keys = await listApiKeysByUser(userId);
    return res.json(keys);
  } catch (err) {
    return res.status(500).json({ error: "Internal server error", detail: err.message });
  }
}

// POST /keys/:id/revoke (JWT)
export async function revokeKey(req, res) {
  try {
    const userId = req.user.userId;
    const id = Number(req.params.id);

    if (!id) return res.status(400).json({ error: "Invalid key id" });

    const affected = await revokeApiKey({ userId, id });
    if (affected === 0) {
      return res.status(404).json({ error: "API key not found" });
    }

    return res.json({ status: "revoked" });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error", detail: err.message });
  }
}
