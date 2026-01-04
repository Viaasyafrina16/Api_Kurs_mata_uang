import pool from "../config/db.js";

export async function createApiKey({ userId, keyHash, keyPrefix, label }) {
  const [result] = await pool.query(
    "INSERT INTO api_keys (user_id, key_hash, key_prefix, label) VALUES (?, ?, ?, ?)",
    [userId, keyHash, keyPrefix, label || null]
  );
  return result.insertId;
}

export async function listApiKeysByUser(userId) {
  const [rows] = await pool.query(
    "SELECT id, key_prefix AS prefix, label, status, last_used_at, created_at FROM api_keys WHERE user_id = ? ORDER BY id DESC",
    [userId]
  );
  return rows;
}

export async function revokeApiKey({ userId, id }) {
  const [result] = await pool.query(
    "UPDATE api_keys SET status = 'revoked' WHERE id = ? AND user_id = ?",
    [id, userId]
  );
  return result.affectedRows; // 1 kalau sukses
}
