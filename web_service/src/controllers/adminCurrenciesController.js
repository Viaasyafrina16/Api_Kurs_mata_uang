import {
  adminListCurrencies,
  adminCreateCurrency,
  adminUpdateCurrency,
  adminDeleteCurrency
} from "../models/currency.model.js";

// GET /admin/currencies
export async function listCurrencies(req, res) {
  try {
    const rows = await adminListCurrencies();
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: "Internal server error", detail: err.message });
  }
}

// POST /admin/currencies
export async function createCurrency(req, res) {
  try {
    const code = (req.body.code || "").toUpperCase().trim();
    const name = (req.body.name || "").trim();
    const status = (req.body.status || "active").trim();

    if (!code || code.length !== 3 || !name) {
      return res.status(400).json({ error: "code (3 huruf) dan name wajib" });
    }

    await adminCreateCurrency({ code, name, status });
    return res.status(201).json({ message: "Currency created", code });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error", detail: err.message });
  }
}

// PUT /admin/currencies/:code
export async function updateCurrency(req, res) {
  try {
    const code = (req.params.code || "").toUpperCase().trim();
    const name = (req.body.name || "").trim();
    const status = (req.body.status || "active").trim();

    if (!code || code.length !== 3 || !name) {
      return res.status(400).json({ error: "code (3 huruf) dan name wajib" });
    }

    const affected = await adminUpdateCurrency({ code, name, status });
    if (!affected) return res.status(404).json({ error: "Currency not found" });

    return res.json({ message: "Currency updated", code });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error", detail: err.message });
  }
}

// DELETE /admin/currencies/:code
export async function deleteCurrency(req, res) {
  try {
    const code = (req.params.code || "").toUpperCase().trim();
    const affected = await adminDeleteCurrency(code);
    if (!affected) return res.status(404).json({ error: "Currency not found" });

    return res.json({ message: "Currency deleted", code });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error", detail: err.message });
  }
}
