import {
  adminListCurrencies,
  adminCreateCurrency,
  adminUpdateCurrency,
  adminDeleteCurrencyHard
} from "../models/currency.model.js";

// GET /admin/currencies
export async function listCurrencies(req, res, next) {
  try {
    const rows = await adminListCurrencies();
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

// POST /admin/currencies
// body: { code, name, status }
export async function createCurrency(req, res, next) {
  try {
    const code = String(req.body.code || "").trim().toUpperCase();
    const name = String(req.body.name || "").trim();
    const status = String(req.body.status || "active").trim().toLowerCase();

    if (code.length !== 3) return res.status(400).json({ error: "code must be 3 letters" });
    if (!name) return res.status(400).json({ error: "name is required" });
    if (!["active", "inactive"].includes(status)) {
      return res.status(400).json({ error: "status must be active or inactive" });
    }

    await adminCreateCurrency({ code, name, status });
    res.status(201).json({ message: "Currency created", code });
  } catch (err) {
    if (err?.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "Currency already exists" });
    }
    next(err);
  }
}

// PUT /admin/currencies/:code
// body: { name, status }
export async function updateCurrency(req, res, next) {
  try {
    const code = String(req.params.code || "").trim().toUpperCase();
    const name = String(req.body.name || "").trim();
    const status = String(req.body.status || "").trim().toLowerCase();

    if (code.length !== 3) return res.status(400).json({ error: "code must be 3 letters" });
    if (!name) return res.status(400).json({ error: "name is required" });
    if (!["active", "inactive"].includes(status)) {
      return res.status(400).json({ error: "status must be active or inactive" });
    }

    const affected = await adminUpdateCurrency(code, { name, status });
    if (!affected) return res.status(404).json({ error: "Currency not found" });

    res.json({ message: "Currency updated", code });
  } catch (err) {
    next(err);
  }
}

// DELETE /admin/currencies/:code  (HARD DELETE beneran)
export async function deleteCurrency(req, res, next) {
  try {
    const code = String(req.params.code || "").trim().toUpperCase();
    if (code.length !== 3) return res.status(400).json({ error: "code must be 3 letters" });

    const affected = await adminDeleteCurrencyHard(code);
    if (!affected) return res.status(404).json({ error: "Currency not found" });

    res.json({ message: "Currency deleted (hard)", code });
  } catch (err) {
    next(err);
  }
}
