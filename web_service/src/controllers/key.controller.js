import { generateApiKey } from "../utils/apiKey.js";
import { hashValue } from "../utils/hash.js";
import { createApiKey, listApiKeysByUser, revokeApiKey } from "../models/apiKey.model.js";

// POST /keys  (JWT)
export async function createKey(req, res) {
  try {
    const userId = req.user.userId;
    const { label } = req.body || {};

    const { raw, prefix } = generateApiKey();
    const keyHash = await hashValue(raw);

    const id = await createApiKey({
      userId,
      keyHash,
      keyPrefix: prefix,
      label: label || null
    });

    // raw key hanya ditampilkan sekali
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

// GET /keys  (JWT)
export async function listKeys(req, res) {
  try {
    const userId = req.user.userId;
    const keys = await listApiKeysByUser(userId);
    return res.json(keys);
  } catch (err) {
    return res.status(500).json({ error: "Internal server error", detail: err.message });
  }
}

// POST /keys/:id/revoke  (JWT)
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
