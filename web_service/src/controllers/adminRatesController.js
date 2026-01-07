import {
  listRates,
  createRate,
  updateRateById,
  deleteRateById
} from "../models/rate.model.js";

// GET /admin/rates?base=USD&quote=IDR&date=2026-01-04
export async function adminListRates(req, res, next) {
  try {
    const base = req.query.base ? String(req.query.base).trim().toUpperCase() : null;
    const quote = req.query.quote ? String(req.query.quote).trim().toUpperCase() : null;
    const date = req.query.date ? String(req.query.date).trim().slice(0, 10) : null;

    const rows = await listRates({ base, quote, date });
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

// POST /admin/rates
// body: { "base_code":"USD", "quote_code":"MYR", "rate":4.7, "rate_date":"2026-01-04" }
export async function adminCreateRate(req, res, next) {
  try {
    const base_code = String(req.body.base_code || "").trim().toUpperCase();
    const quote_code = String(req.body.quote_code || "").trim().toUpperCase();
    const rate = Number(req.body.rate);
    const rate_date = String(req.body.rate_date || "").trim().slice(0, 10);

    if (base_code.length !== 3 || quote_code.length !== 3) {
      return res.status(400).json({ error: "base_code & quote_code must be 3 letters" });
    }
    if (!Number.isFinite(rate) || rate <= 0) {
      return res.status(400).json({ error: "rate must be a positive number" });
    }
    if (!rate_date || rate_date.length !== 10) {
      return res.status(400).json({ error: "rate_date must be YYYY-MM-DD" });
    }

    const id = await createRate({ base_code, quote_code, rate, rate_date });
    res.status(201).json({ message: "Rate created", id });
  } catch (err) {
    if (err?.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "Duplicate rate (already exists)" });
    }
    next(err);
  }
}

// PUT /admin/rates/:id
// body: { "rate": 4.65, "rate_date":"2026-01-04" }
export async function adminUpdateRate(req, res, next) {
  try {
    const id = Number(req.params.id);
    const rate = Number(req.body.rate);
    const rate_date = String(req.body.rate_date || "").trim().slice(0, 10);

    if (!Number.isFinite(id)) return res.status(400).json({ error: "Invalid id" });
    if (!Number.isFinite(rate) || rate <= 0) return res.status(400).json({ error: "rate must be positive" });
    if (!rate_date || rate_date.length !== 10) return res.status(400).json({ error: "rate_date must be YYYY-MM-DD" });

    const affected = await updateRateById(id, { rate, rate_date });
    if (!affected) return res.status(404).json({ error: "Rate not found" });

    res.json({ message: "Rate updated", id });
  } catch (err) {
    next(err);
  }
}

// DELETE /admin/rates/:id   (HARD DELETE)
export async function adminDeleteRate(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: "Invalid id" });

    const affected = await deleteRateById(id);
    if (!affected) return res.status(404).json({ error: "Rate not found" });

    res.json({ message: "Rate deleted", id });
  } catch (err) {
    next(err);
  }
}
