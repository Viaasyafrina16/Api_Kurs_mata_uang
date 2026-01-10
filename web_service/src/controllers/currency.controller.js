import { getLatestRates, getRateLatest } from "../models/rate.model.js";
import pool from "../config/db.js";

const KEY_LIMIT = 100;

// helper parse symbols: "USD,EUR" -> ["USD","EUR"]
function parseSymbols(symbolsStr) {
  if (!symbolsStr) return [];
  return symbolsStr
    .split(",")
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);
}

// GET /api/v1/currency/latest?base=USD&symbols=IDR,EUR
export async function latest(req, res) {
  try {
    const base = (req.query.base || "USD").toUpperCase();
    const symbols = parseSymbols(req.query.symbols);

    if (symbols.length === 0) {
      return res.status(400).json({ error: "Query symbols wajib diisi, contoh: symbols=USD,EUR" });
    }

    const result = await getLatestRates({ base, symbols });
    if (!result) {
      return res.status(404).json({ error: `No rates found for base ${base}` });
    }

    const ratesObj = {};
    for (const r of result.rates) {
      ratesObj[r.quote_code] = Number(r.rate);
    }

    return res.json({ base, date: result.date, rates: ratesObj });
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message || "Internal server error" });
  }
}

// GET /api/v1/currency/convert?from=USD&to=IDR&amount=10
export async function convert(req, res) {
  try {
    const from = (req.query.from || "").toUpperCase();
    const to = (req.query.to || "").toUpperCase();
    const amount = Number(req.query.amount);

    if (!from || !to || !Number.isFinite(amount)) {
      return res.status(400).json({
        error: "Query wajib: from, to, amount. Contoh: ?from=USD&to=IDR&amount=10"
      });
    }

    const data = await getRateLatest({ from, to });
    if (!data) {
      return res.status(404).json({ error: `Rate not found for ${from} -> ${to}` });
    }

    const rate = Number(data.rate);
    const result = amount * rate;

    return res.json({
      from,
      to,
      amount,
      rate,
      result,
      date: data.rate_date
    });
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message || "Internal server error" });
  }
}

// GET /api/v1/currency/quota  (header: x-api-key)
// ✅ TOTAL QUOTA per API key (bukan per hari)
export async function quota(req, res) {
  try {
    const apiKeyId = req.apiKey?.id;
    if (!apiKeyId) return res.status(401).json({ error: "Invalid API key" });

    const [[usage]] = await pool.query(
      `
      SELECT COUNT(*) AS used_total
      FROM usage_logs
      WHERE api_key_id = ?
      `,
      [apiKeyId]
    );

    const usedTotal = Number(usage?.used_total || 0);
    const remaining = Math.max(0, KEY_LIMIT - usedTotal);

    return res.json({
      limit_total: KEY_LIMIT,
      used_total: usedTotal,
      remaining_total: remaining
    });
  } catch (e) {
    return res.status(500).json({ error: "Internal server error" });
  }
}
