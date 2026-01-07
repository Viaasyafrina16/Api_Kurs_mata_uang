import pool from "../config/db.js";

// =====================
// PUBLIC (dipakai API)
// =====================
export async function listActiveCurrencies() {
  const [rows] = await pool.query(
    "SELECT code, name, status FROM currencies WHERE status='active' ORDER BY code ASC"
  );
  return rows;
}

// =====================
// ADMIN CRUD
// =====================
export async function adminListCurrencies() {
  // NOTE: jangan select created_at kalau kolomnya tidak ada di tabel
  const [rows] = await pool.query(
    "SELECT code, name, status FROM currencies ORDER BY code ASC"
  );
  return rows;
}

export async function adminCreateCurrency({ code, name, status = "active" }) {
  const [result] = await pool.query(
    "INSERT INTO currencies (code, name, status) VALUES (?, ?, ?)",
    [code, name, status]
  );
  return result.affectedRows;
}

export async function adminUpdateCurrency(code, { name, status }) {
  const [result] = await pool.query(
    "UPDATE currencies SET name=?, status=? WHERE code=?",
    [name, status, code]
  );
  return result.affectedRows;
}

/**
 * HARD DELETE currency:
 * - hapus dulu rate yg terkait (agar tidak kena foreign key)
 * - baru hapus currency
 */
export async function adminDeleteCurrencyHard(code) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    await conn.query(
      "DELETE FROM currency_rates WHERE base_code = ? OR quote_code = ?",
      [code, code]
    );

    const [result] = await conn.query(
      "DELETE FROM currencies WHERE code = ?",
      [code]
    );

    await conn.commit();
    return result.affectedRows;
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}
// =====================
// ADMIN: CREATE CURRENCY + INITIAL RATE (TRANSACTION)
// =====================
export async function adminCreateCurrencyWithRate({
  code,
  name,
  status = "active",
  base_code = "USD",
  rate,
  rate_date
}) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 1) insert currency
    await conn.query(
      "INSERT INTO currencies (code, name, status) VALUES (?, ?, ?)",
      [code, name, status]
    );

    // 2) insert initial rate (contoh: USD -> MYR)
    const [rateRes] = await conn.query(
      `INSERT INTO currency_rates (base_code, quote_code, rate, rate_date)
       VALUES (?, ?, ?, ?)`,
      [base_code, code, rate, rate_date]
    );

    await conn.commit();
    return { rateId: rateRes.insertId };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}
