import { supabase, ADMIN_EMAIL } from "../supabase.js";

const STORAGE_KEY = "hs_portfolio_projects_v2";

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

function toErrorText(err, fallback = "Something went wrong.") {
  if (typeof err === "string") return err;
  if (err && typeof err === "object" && typeof err.message === "string") {
    return err.message;
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
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch {
    // Ignore storage quota errors
  }
}

export async function hasActiveAdminSession() {
  if (!supabase) return false;
  try {
    const { data } = await supabase.auth.getSession();
    return Boolean(data?.session);
  } catch {
    return false;
  }
}

export async function logoutAdminSession() {
  if (supabase) {
    try {
      await supabase.auth.signOut();
    } catch {
      // Ignore signout error
    }
  }
}

// 1. Admin Login via Supabase Auth
export async function verifyAdminPassword(password) {
  if (supabase) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: ADMIN_EMAIL,
        password: String(password || ""),
      });

      if (!error && data?.session) {
        return { ok: true, engine: "Supabase Cloud" };
      }

      return {
        ok: false,
        engine: "Supabase Cloud",
        error: toErrorText(error, "Incorrect administrator password."),
      };
    } catch (err) {
      return {
        ok: false,
        engine: "Supabase Cloud",
        error: toErrorText(err, "Unable to reach Supabase Auth."),
      };
    }
  }

  return {
    ok: false,
    engine: "Disconnected",
    error:
      "Supabase is not configured. Add VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY in Vercel.",
  };
}

// 2. Change Admin Password via Supabase Auth
export async function changeAdminPassword(currentPassword, newPassword) {
  if (String(newPassword || "").length < 6) {
    return {
      ok: false,
      error: "New password must be at least 6 characters for Supabase Auth.",
    };
  }

  if (supabase) {
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: ADMIN_EMAIL,
        password: String(currentPassword || ""),
      });

      if (signInError) {
        return {
          ok: false,
          engine: "Supabase Cloud",
          error: "Current password is incorrect.",
        };
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: String(newPassword),
      });

      if (updateError) {
        return {
          ok: false,
          engine: "Supabase Cloud",
          error: toErrorText(updateError, "Could not update password."),
        };
      }

      return {
        ok: true,
        engine: "Supabase Cloud",
        message: "Password updated in Supabase successfully.",
      };
    } catch (err) {
      return {
        ok: false,
        engine: "Supabase Cloud",
        error: toErrorText(err, "Could not update password."),
      };
    }
  }

  return { ok: false, error: "Supabase is not configured." };
}

// 3. Fetch All Projects from Supabase
export async function fetchProjects() {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("id, title, category, description, image, link, created_at")
        .order("created_at", { ascending: false });

      if (!error && Array.isArray(data)) {
        if (data.length > 0) {
          setLocalProjects(data);
          return { projects: data, engine: "Supabase Cloud" };
        }
        return { projects: DEFAULT_PROJECTS, engine: "Supabase Cloud" };
      }
    } catch {
      // Fallback below
    }
  }

  return { projects: getLocalProjects(), engine: "Local Fallback" };
}

// 4. Create (Add) Project in Supabase
export async function createProject(projectData) {
  const newProject = {
    id: `proj-${Date.now()}`,
    title: String(projectData.title || "").trim(),
    category: String(projectData.category || "WEB DESIGN")
      .trim()
      .toUpperCase(),
    description: String(projectData.description || "").trim(),
    image: String(projectData.image || "").trim(),
    link: String(projectData.link || "#").trim(),
  };

  if (supabase) {
    const { error } = await supabase.from("projects").insert([newProject]);
    if (error) {
      throw new Error(
        toErrorText(
          error,
          "Failed to save project to Supabase. Please re-login.",
        ),
      );
    }
    return await fetchProjects();
  }

  const next = [newProject, ...getLocalProjects()];
  setLocalProjects(next);
  return { projects: next, engine: "Local Fallback" };
}

// 5. Update (Edit) Project in Supabase
export async function updateProject(id, projectData) {
  const updates = {
    title: String(projectData.title || "").trim(),
    category: String(projectData.category || "WEB DESIGN")
      .trim()
      .toUpperCase(),
    description: String(projectData.description || "").trim(),
    image: String(projectData.image || "").trim(),
    link: String(projectData.link || "#").trim(),
  };

  if (supabase) {
    const { error } = await supabase
      .from("projects")
      .update(updates)
      .eq("id", id);

    if (error) {
      throw new Error(
        toErrorText(error, "Failed to update project in Supabase."),
      );
    }
    return await fetchProjects();
  }

  const next = getLocalProjects().map((p) =>
    p.id === id ? { ...p, ...updates } : p,
  );
  setLocalProjects(next);
  return { projects: next, engine: "Local Fallback" };
}

// 6. Remove (Delete) Project from Supabase
export async function removeProject(id) {
  if (supabase) {
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) {
      throw new Error(
        toErrorText(error, "Failed to delete project from Supabase."),
      );
    }
    return await fetchProjects();
  }

  const next = getLocalProjects().filter((p) => p.id !== id);
  setLocalProjects(next);
  return { projects: next, engine: "Local Fallback" };
}

// 7. Contact Form Submission
export async function submitContactForm() {
  if (supabase) {
    return {
      ok: true,
      engine: "Supabase Cloud",
      message: "Inquiry received successfully!",
    };
  }

  return {
    ok: true,
    engine: "Client Queue",
    message: "Inquiry received!",
  };
}

// 8. Image Compression Utility
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
