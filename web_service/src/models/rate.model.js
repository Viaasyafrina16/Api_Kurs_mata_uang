import pool from "../config/db.js";

// ambil rate terbaru untuk base dan daftar symbols
export async function getLatestRates({ base, symbols }) {
  // cari tanggal terbaru yang ada untuk base
  const [latestRows] = await pool.query(
    "SELECT MAX(rate_date) AS latest_date FROM currency_rates WHERE base_code = ?",
    [base]
  );

  const latestDate = latestRows[0]?.latest_date;
  if (!latestDate) return null;

  // ambil rates untuk tanggal itu
  const [rows] = await pool.query(
    `SELECT quote_code, rate
     FROM currency_rates
     WHERE base_code = ? AND rate_date = ? AND quote_code IN (?)`,
    [base, latestDate, symbols]
  );

  return { date: latestDate, rates: rows };
}

// ambil rate untuk convert pada tanggal terbaru (atau tanggal tertentu nanti)
export async function getRateLatest({ from, to }) {
  const [latestRows] = await pool.query(
    "SELECT MAX(rate_date) AS latest_date FROM currency_rates WHERE base_code = ? AND quote_code = ?",
    [from, to]
  );

  const latestDate = latestRows[0]?.latest_date;
  if (!latestDate) return null;

  const [rows] = await pool.query(
    "SELECT rate, rate_date FROM currency_rates WHERE base_code = ? AND quote_code = ? AND rate_date = ? LIMIT 1",
    [from, to, latestDate]
  );

  return rows[0] || null;
}
