export async function getBackendUrl() {
  const res = await fetch("/config");
  const data = await res.json();
  return data.backendUrl;
}

export function saveToken(token) {
  localStorage.setItem("jwt_token", token);
}

export function getToken() {
  return localStorage.getItem("jwt_token");
}

export function logout() {
  localStorage.removeItem("jwt_token");
  window.location.href = "/login";
}

// ✅ FIX: base64url decode + padding
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
