const STORAGE_KEY = "hs_portfolio_projects_v2";
const ADMIN_HASH_KEY = "hs_portfolio_admin_hash_v1";
import { supabase } from "../supabase.js";

export const DEFAULT_PROJECTS = [
  {
    id: "proj-1",
    title: "Luxora Watches",
    category: "E-COMMERCE",
    description: "Ultra-Luxury Horology Experience",
    image:
      "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=700&q=80",
    link: "./luxora-watches/index.html",
  },
  {
    id: "proj-2",
    title: "Interior Studio",
    category: "CORPORATE",
    description: "Quiet-Luxury Architectural Archive",
    image:
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=700&q=80",
    link: "./interior-desgin/index-interior.html",
  },
  {
    id: "proj-3",
    title: "FitZone Gym",
    category: "FITNESS",
    description: "High-Converting Athletic Funnel",
    image:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=700&q=80",
    link: "./fintzone-gym/index-fitzone.html",
  },
  {
    id: "proj-4",
    title: "Café Aurora",
    category: "HOSPITALITY",
    description: "Artisan Culinary Digital Menu",
    image:
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=700&q=80",
    link: "./aurora-cafe/index-cafe.html",
  },
];

function toSafeText(value, fallback = "") {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && typeof value.message === "string") {
    return value.message;
  }
  return fallback;
}

function getLocalProjects() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PROJECTS));
      return [...DEFAULT_PROJECTS];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0
      ? parsed
      : [...DEFAULT_PROJECTS];
  } catch {
    return [...DEFAULT_PROJECTS];
  }
}

function setLocalProjects(projects) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

async function hashClientPassword(plain) {
  if (window.crypto?.subtle) {
    const data = new TextEncoder().encode(`hs-portfolio-vault-2026:${plain}`);
    const digest = await window.crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
  return plain;
}

async function getLocalAdminHash() {
  const saved = localStorage.getItem(ADMIN_HASH_KEY);
  if (saved) return saved;
  const defaultHash = await hashClientPassword("hamood123");
  localStorage.setItem(ADMIN_HASH_KEY, defaultHash);
  return defaultHash;
}

async function tryJsonFetch(url, options = {}) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  const data = await res.json().catch(() => null);
  const isBackendResponse = Boolean(
    data && typeof data === "object" && typeof data.ok === "boolean",
  );
  return { status: res.status, ok: res.ok, data, isBackendResponse };
}

export async function verifyAdminPassword(password) {
  try {
    const res = await tryJsonFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ password }),
    });
    if (res.isBackendResponse) {
      if (res.data.ok) {
        const h = await hashClientPassword(password);
        localStorage.setItem(ADMIN_HASH_KEY, h);
      }
      return {
        ok: Boolean(res.data.ok),
        engine: toSafeText(res.data.engine, "Node.js"),
        error: toSafeText(res.data.error, "Incorrect password."),
      };
    }
  } catch {
    // Fallback to PHP
  }

  try {
    const res = await tryJsonFetch("/php/api.php?resource=auth&action=login", {
      method: "POST",
      body: JSON.stringify({ password }),
    });
    if (res.isBackendResponse) {
      if (res.data.ok) {
        const h = await hashClientPassword(password);
        localStorage.setItem(ADMIN_HASH_KEY, h);
      }
      return {
        ok: Boolean(res.data.ok),
        engine: toSafeText(res.data.engine, "PHP"),
        error: toSafeText(res.data.error, "Incorrect password."),
      };
    }
  } catch {
    // Fallback to LocalStorage
  }

  const storedHash = await getLocalAdminHash();
  const enteredHash = await hashClientPassword(password);
  return enteredHash === storedHash
    ? { ok: true, engine: "Local Sync" }
    : { ok: false, engine: "Local Sync", error: "Incorrect password." };
}

export async function changeAdminPassword(currentPassword, newPassword) {
  try {
    const res = await tryJsonFetch("/api/auth/change-password", {
      method: "POST",
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    if (res.isBackendResponse) {
      if (res.data.ok) {
        const h = await hashClientPassword(newPassword);
        localStorage.setItem(ADMIN_HASH_KEY, h);
      }
      return {
        ok: Boolean(res.data.ok),
        engine: toSafeText(res.data.engine, "Node.js"),
        message: toSafeText(res.data.message, "Password updated successfully."),
        error: toSafeText(res.data.error, "Could not update password."),
      };
    }
  } catch {
    // Fallback to PHP
  }

  try {
    const res = await tryJsonFetch(
      "/php/api.php?resource=auth&action=change_password",
      {
        method: "POST",
        body: JSON.stringify({ currentPassword, newPassword }),
      },
    );
    if (res.isBackendResponse) {
      if (res.data.ok) {
        const h = await hashClientPassword(newPassword);
        localStorage.setItem(ADMIN_HASH_KEY, h);
      }
      return {
        ok: Boolean(res.data.ok),
        engine: toSafeText(res.data.engine, "PHP"),
        message: toSafeText(res.data.message, "Password updated successfully."),
        error: toSafeText(res.data.error, "Could not update password."),
      };
    }
  } catch {
    // Fallback to LocalStorage
  }

  if (String(newPassword).length < 4) {
    return {
      ok: false,
      error: "New password must be at least 4 characters.",
    };
  }
  const storedHash = await getLocalAdminHash();
  const currentHash = await hashClientPassword(currentPassword);
  if (currentHash !== storedHash) {
    return { ok: false, error: "Current password is incorrect." };
  }
  const nextHash = await hashClientPassword(newPassword);
  localStorage.setItem(ADMIN_HASH_KEY, nextHash);
  return {
    ok: true,
    engine: "Local Sync",
    message: "Password updated successfully.",
  };
}

export async function fetchProjects() {
  try {
    const res = await tryJsonFetch("/api/projects");
    if (
      res.isBackendResponse &&
      res.data.ok &&
      Array.isArray(res.data.projects)
    ) {
      setLocalProjects(res.data.projects);
      return {
        projects: res.data.projects,
        engine: toSafeText(res.data.engine, "Node.js"),
      };
    }
  } catch {
    // Fallback to PHP backend
  }

  try {
    const res = await tryJsonFetch("/php/api.php?resource=projects");
    if (
      res.isBackendResponse &&
      res.data.ok &&
      Array.isArray(res.data.projects)
    ) {
      setLocalProjects(res.data.projects);
      return {
        projects: res.data.projects,
        engine: toSafeText(res.data.engine, "PHP"),
      };
    }
  } catch {
    // Fallback to LocalStorage sync
  }

  return { projects: getLocalProjects(), engine: "Local Sync" };
}

export async function createProject(projectData) {
  try {
    const res = await tryJsonFetch("/api/projects", {
      method: "POST",
      body: JSON.stringify(projectData),
    });
    if (
      res.isBackendResponse &&
      res.data.ok &&
      Array.isArray(res.data.projects)
    ) {
      setLocalProjects(res.data.projects);
      return { projects: res.data.projects, engine: "Node.js" };
    }
  } catch {
    // Try PHP
  }

  try {
    const res = await tryJsonFetch("/php/api.php?resource=projects", {
      method: "POST",
      body: JSON.stringify(projectData),
    });
    if (
      res.isBackendResponse &&
      res.data.ok &&
      Array.isArray(res.data.projects)
    ) {
      setLocalProjects(res.data.projects);
      return { projects: res.data.projects, engine: "PHP" };
    }
  } catch {
    // Local fallback
  }

  const next = [
    {
      id: `proj-${Date.now()}`,
      ...projectData,
      category: String(projectData.category || "WEB DESIGN").toUpperCase(),
    },
    ...getLocalProjects(),
  ];
  setLocalProjects(next);
  return { projects: next, engine: "Local Sync" };
}

export async function updateProject(id, projectData) {
  try {
    const res = await tryJsonFetch(`/api/projects/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify(projectData),
    });
    if (
      res.isBackendResponse &&
      res.data.ok &&
      Array.isArray(res.data.projects)
    ) {
      setLocalProjects(res.data.projects);
      return { projects: res.data.projects, engine: "Node.js" };
    }
  } catch {
    // Try PHP
  }

  try {
    const res = await tryJsonFetch(
      `/php/api.php?resource=projects&id=${encodeURIComponent(id)}`,
      {
        method: "PUT",
        body: JSON.stringify(projectData),
      },
    );
    if (
      res.isBackendResponse &&
      res.data.ok &&
      Array.isArray(res.data.projects)
    ) {
      setLocalProjects(res.data.projects);
      return { projects: res.data.projects, engine: "PHP" };
    }
  } catch {
    // Local fallback
  }

  const next = getLocalProjects().map((p) =>
    p.id === id
      ? {
          ...p,
          ...projectData,
          category: String(projectData.category || p.category).toUpperCase(),
        }
      : p,
  );
  setLocalProjects(next);
  return { projects: next, engine: "Local Sync" };
}

export async function removeProject(id) {
  try {
    const res = await tryJsonFetch(`/api/projects/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    if (
      res.isBackendResponse &&
      res.data.ok &&
      Array.isArray(res.data.projects)
    ) {
      setLocalProjects(res.data.projects);
      return { projects: res.data.projects, engine: "Node.js" };
    }
  } catch {
    // Try PHP
  }

  try {
    const res = await tryJsonFetch(
      `/php/api.php?resource=projects&id=${encodeURIComponent(id)}`,
      { method: "DELETE" },
    );
    if (
      res.isBackendResponse &&
      res.data.ok &&
      Array.isArray(res.data.projects)
    ) {
      setLocalProjects(res.data.projects);
      return { projects: res.data.projects, engine: "PHP" };
    }
  } catch {
    // Local fallback
  }

  const next = getLocalProjects().filter((p) => p.id !== id);
  setLocalProjects(next);
  return { projects: next, engine: "Local Sync" };
}

export async function submitContactForm(payload) {
  try {
    const res = await tryJsonFetch("/api/contact", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    if (res.isBackendResponse && res.data.ok) return res.data;
  } catch {
    // Try PHP
  }

  try {
    const res = await tryJsonFetch("/php/api.php?resource=contact", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    if (res.isBackendResponse && res.data.ok) return res.data;
  } catch {
    // Fallback
  }

  return {
    ok: true,
    engine: "Client Queue",
    message:
      "Inquiry prepared! Connect Node.js or PHP backend for persistent storage.",
  };
}

export function fileToCompressedDataUrl(file, maxWidth = 800) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.onerror = reject;
      img.src = event.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
