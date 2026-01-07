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
// ===== ADMIN CRUD =====
export async function listRates({ base, quote, date }) {
  let sql = `
    SELECT id, base_code, quote_code, rate, rate_date, created_at
    FROM currency_rates
    WHERE 1=1
  `;
  const params = [];

  if (base) { sql += " AND base_code = ?"; params.push(base); }
  if (quote) { sql += " AND quote_code = ?"; params.push(quote); }
  if (date) { sql += " AND rate_date = ?"; params.push(date); }

  sql += " ORDER BY rate_date DESC, base_code ASC, quote_code ASC";
  const [rows] = await pool.query(sql, params);
  return rows;
}

export async function createRate({ base_code, quote_code, rate, rate_date }) {
  const sql = `
    INSERT INTO currency_rates (base_code, quote_code, rate, rate_date)
    VALUES (?, ?, ?, ?)
  `;
  const [result] = await pool.query(sql, [base_code, quote_code, rate, rate_date]);
  return result.insertId;
}

export async function updateRateById(id, { rate, rate_date }) {
  const sql = `
    UPDATE currency_rates
    SET rate = ?, rate_date = ?
    WHERE id = ?
  `;
  const [result] = await pool.query(sql, [rate, rate_date, id]);
  return result.affectedRows;
}

export async function deleteRateById(id) {
  const sql = `DELETE FROM currency_rates WHERE id = ?`;
  const [result] = await pool.query(sql, [id]);
  return result.affectedRows;
}

