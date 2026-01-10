import pool from "../config/db.js";

// helper: pastikan currency ada & active
async function assertCurrencyActive(code) {
  const [rows] = await pool.query(
    "SELECT code, status FROM currencies WHERE code = ? LIMIT 1",
    [code]
  );

  if (!rows.length) {
    const err = new Error(`Currency ${code} tidak ditemukan`);
    err.status = 404;
    throw err;
  }

  if (rows[0].status !== "active") {
    const err = new Error(`Currency ${code} sedang inactive`);
    err.status = 403;
    throw err;
  }
}

// ambil rate terbaru untuk base dan daftar symbols (HANYA ACTIVE)
export async function getLatestRates({ base, symbols }) {
  // base harus active
  await assertCurrencyActive(base);

  // symbols wajib array
  if (!Array.isArray(symbols) || symbols.length === 0) return null;

  // cari tanggal terbaru yang ada untuk base
  // NOTE: tidak perlu filter quote di sini, cukup ambil max untuk base
  const [latestRows] = await pool.query(
    "SELECT MAX(rate_date) AS latest_date FROM currency_rates WHERE base_code = ?",
    [base]
  );

  const latestDate = latestRows[0]?.latest_date;
  if (!latestDate) return null;

  // ambil rates untuk tanggal itu
  // ✅ hanya quote yang ACTIVE
  // ✅ kalau ada symbol yang inactive, otomatis gak ikut keluar
  const [rows] = await pool.query(
    `
    SELECT cr.quote_code, cr.rate
    FROM currency_rates cr
    JOIN currencies cq
      ON cq.code = cr.quote_code
     AND cq.status = 'active'
    WHERE cr.base_code = ?
      AND cr.rate_date = ?
      AND cr.quote_code IN (?)
    `,
    [base, latestDate, symbols]
  );

  // kalau semua symbol ternyata inactive, rows bisa kosong -> tetap balikin date+rates kosong
  return { date: latestDate, rates: rows };
}

// ambil rate untuk convert pada tanggal terbaru (HANYA ACTIVE)
export async function getRateLatest({ from, to }) {
  // from & to harus active
  await assertCurrencyActive(from);
  await assertCurrencyActive(to);

  // ambil rate terbaru untuk pasangan from->to
  const [rows] = await pool.query(
    `
    SELECT cr.rate, cr.rate_date
    FROM currency_rates cr
    WHERE cr.base_code = ?
      AND cr.quote_code = ?
    ORDER BY cr.rate_date DESC
    LIMIT 1
    `,
    [from, to]
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
