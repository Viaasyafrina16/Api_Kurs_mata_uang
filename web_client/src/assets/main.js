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

export async function apiFetch(path, options = {}) {
  const baseUrl = await getBackendUrl();
  const token = getToken();

  const headers = {
    ...(options.headers || {}),
    "Content-Type": "application/json"
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(baseUrl + path, { ...options, headers });

  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = { raw: text }; }

  if (!res.ok) {
    throw new Error(json.error || json.detail || `HTTP ${res.status}`);
  }

  return json;
}
