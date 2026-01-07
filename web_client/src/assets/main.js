// web_client/assets/main.js

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

export function parseJwt(token) {
  try {
    const part = token.split(".")[1];
    const json = atob(part.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function getRoleFromToken() {
  const token = getToken();
  if (!token) return null;
  const payload = parseJwt(token);
  return payload?.role || null;
}

export async function apiFetch(path, options = {}) {
  const baseUrl = await getBackendUrl();
  const token = getToken();

  const headers = {
    ...(options.headers || {}),
    "Content-Type": "application/json",
  };

  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(baseUrl + path, { ...options, headers });

  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = { raw: text }; }

  if (!res.ok) {
    const err = new Error(json.error || json.detail || json.message || `HTTP ${res.status}`);
    err.status = res.status;
    err.body = json;
    throw err;
  }

  return json;
}
