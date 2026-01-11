export async function getBackendUrl() {
  const res = await fetch("/config");
  const data = await res.json();
  return data.backendUrl;
}

export function saveToken(token) {
  localStorage.setItem("jwt_token", token);

  // set current user id
  const p = parseJwt(token);
  const userId = p?.userId ?? p?.user_id ?? p?.id ?? null;
  if (userId !== null && userId !== undefined) {
    localStorage.setItem("current_user_id", String(userId));
    // migrasi key lama (demo_api_key) ke storage per user
    migrateLegacyApiKey(String(userId));
  }
}

export function getToken() {
  return localStorage.getItem("jwt_token");
}

export function logout() {
  localStorage.removeItem("jwt_token");
  localStorage.removeItem("current_user_id");
  window.location.href = "/login";
}

export function parseJwt(token) {
  try {
    const part = token.split(".")[1];
    const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

export function getRoleFromToken() {
  const t = getToken();
  if (!t) return null;
  const p = parseJwt(t);
  return p?.role || null;
}

export function getCurrentUserId() {
  return localStorage.getItem("current_user_id");
}

// API key per user 
export function getUserApiKey(userId) {
  if (!userId) return "";
  return localStorage.getItem(`demo_api_key_user_${userId}`) || "";
}

export function setUserApiKey(userId, apiKey) {
  if (!userId) return;
  localStorage.setItem(`demo_api_key_user_${userId}`, apiKey);
}

export function clearUserApiKey(userId) {
  if (!userId) return;
  localStorage.removeItem(`demo_api_key_user_${userId}`);
}

//  Migrasi key lama dari storage global (demo_api_key) ke per-user
export function migrateLegacyApiKey(userId) {
  if (!userId) return;

  const perUserKey = getUserApiKey(userId);
  if (perUserKey) return; // sudah ada, tidak perlu migrasi

  const legacy = (localStorage.getItem("demo_api_key") || "").trim();
  if (!legacy) return;

  // pindahkan legacy key ke per-user
  setUserApiKey(userId, legacy);

  // hapus key global supaya akun lain tidak bisa “nebeng”
  localStorage.removeItem("demo_api_key");
}

export async function apiFetch(path, options = {}) {
  const baseUrl = await getBackendUrl();
  const token = getToken();

  const headers = {
    ...(options.headers || {}),
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(baseUrl + path, { ...options, headers });

  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text };
  }

  if (!res.ok) {
    const err = new Error(json.error || json.detail || `HTTP ${res.status}`);
    err.status = res.status;
    err.body = json;
    throw err;
  }

  return json;
}
