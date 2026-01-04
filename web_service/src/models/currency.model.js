import pool from "../config/db.js";

export async function adminListCurrencies() {
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

export async function adminUpdateCurrency({ code, name, status = "active" }) {
  const [result] = await pool.query(
    "UPDATE currencies SET name = ?, status = ? WHERE code = ?",
    [name, status, code]
  );
  return result.affectedRows;
}

export async function adminDeleteCurrency(code) {
  const [result] = await pool.query(
    "UPDATE currencies SET status = 'inactive' WHERE code = ?",
    [code]
  );
  return result.affectedRows;
}
