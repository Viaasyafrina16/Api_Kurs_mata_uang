// client-web/src/assets/main.js

export async function getBackendUrl() {
  const res = await fetch("/config");
  if (!res.ok) throw new Error(`Failed to load /config (HTTP ${res.status})`);
  const data = await res.json();

  // pastikan tidak ada trailing slash
  return String(data.backendUrl || "").replace(/\/+$/, "");
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

// helper gabung URL biar aman
function joinUrl(base, path) {
  if (!path.startsWith("/")) path = "/" + path;
  return base + path;
}

export async function apiFetch(path, options = {}) {
  const baseUrl = await getBackendUrl();
  const token = getToken();

  const headers = {
    ...(options.headers || {}),
  };

  // Set Content-Type hanya kalau ada body (biar GET gak aneh-aneh)
  if (options.body && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const url = joinUrl(baseUrl, path);

  const res = await fetch(url, { ...options, headers });

  // ambil text dulu, lalu coba parse json
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }

  if (!res.ok) {
    // bikin pesan error yang lebih jelas
    const msg =
      (data && (data.error || data.detail || data.message)) ||
      (typeof data?.raw === "string" && data.raw.slice(0, 200)) ||
      `HTTP ${res.status}`;

    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    err.url = url;
    throw err;
  }

  return data;
}
