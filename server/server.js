import express from "express";
import cors from "cors";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, "../data");
const PROJECTS_FILE = path.join(DATA_DIR, "projects.json");
const INQUIRIES_FILE = path.join(DATA_DIR, "inquiries.json");
const ADMIN_FILE = path.join(DATA_DIR, "admin.json");

const AUTH_SALT = "hs-portfolio-vault-2026";
function hashPassword(plain) {
  return crypto
    .createHash("sha256")
    .update(`${AUTH_SALT}:${plain}`)
    .digest("hex");
}

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "8mb" }));

const DEFAULT_PROJECTS = [
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

async function ensureFile(filePath, fallbackData) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw);
  } catch {
    await fs.writeFile(filePath, JSON.stringify(fallbackData, null, 2));
    return fallbackData;
  }
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, engine: "Node.js Express" });
});

app.post("/api/auth/login", async (req, res) => {
  const password = String(req.body.password || "");
  const adminData = await ensureFile(ADMIN_FILE, {
    passwordHash: hashPassword("hamood123"),
  });

  if (hashPassword(password) === adminData.passwordHash) {
    return res.json({ ok: true, engine: "Node.js" });
  }
  return res.status(401).json({ ok: false, error: "Incorrect password." });
});

app.post("/api/auth/change-password", async (req, res) => {
  const currentPassword = String(req.body.currentPassword || "");
  const newPassword = String(req.body.newPassword || "");

  if (newPassword.length < 4) {
    return res.status(400).json({
      ok: false,
      error: "New password must be at least 4 characters.",
    });
  }

  const adminData = await ensureFile(ADMIN_FILE, {
    passwordHash: hashPassword("hamood123"),
  });

  if (hashPassword(currentPassword) !== adminData.passwordHash) {
    return res
      .status(401)
      .json({ ok: false, error: "Current password is incorrect." });
  }

  await fs.writeFile(
    ADMIN_FILE,
    JSON.stringify({ passwordHash: hashPassword(newPassword) }, null, 2),
  );
  return res.json({
    ok: true,
    engine: "Node.js",
    message: "Password updated successfully.",
  });
});

app.get("/api/projects", async (_req, res) => {
  const projects = await ensureFile(PROJECTS_FILE, DEFAULT_PROJECTS);
  res.json({ ok: true, engine: "Node.js", projects });
});

app.post("/api/projects", async (req, res) => {
  const projects = await ensureFile(PROJECTS_FILE, DEFAULT_PROJECTS);
  const newProject = {
    id: `proj-${Date.now()}`,
    title: String(req.body.title || "").trim(),
    category: String(req.body.category || "WEB DESIGN")
      .trim()
      .toUpperCase(),
    description: String(req.body.description || "").trim(),
    image: String(req.body.image || "").trim(),
    link: String(req.body.link || "#").trim(),
  };

  if (!newProject.title || !newProject.description || !newProject.image) {
    return res
      .status(400)
      .json({ ok: false, error: "Missing required fields" });
  }

  const updated = [newProject, ...projects];
  await fs.writeFile(PROJECTS_FILE, JSON.stringify(updated, null, 2));
  res.status(201).json({
    ok: true,
    engine: "Node.js",
    project: newProject,
    projects: updated,
  });
});

app.put("/api/projects/:id", async (req, res) => {
  const projects = await ensureFile(PROJECTS_FILE, DEFAULT_PROJECTS);
  const { id } = req.params;
  const updated = projects.map((p) =>
    p.id === id
      ? {
          ...p,
          title: String(req.body.title ?? p.title).trim(),
          category: String(req.body.category ?? p.category)
            .trim()
            .toUpperCase(),
          description: String(req.body.description ?? p.description).trim(),
          image: String(req.body.image ?? p.image).trim(),
          link: String(req.body.link ?? p.link).trim(),
        }
      : p,
  );
  await fs.writeFile(PROJECTS_FILE, JSON.stringify(updated, null, 2));
  res.json({ ok: true, engine: "Node.js", projects: updated });
});

app.delete("/api/projects/:id", async (req, res) => {
  const projects = await ensureFile(PROJECTS_FILE, DEFAULT_PROJECTS);
  const updated = projects.filter((p) => p.id !== req.params.id);
  await fs.writeFile(PROJECTS_FILE, JSON.stringify(updated, null, 2));
  res.json({ ok: true, engine: "Node.js", projects: updated });
});

app.post("/api/contact", async (req, res) => {
  const { name, email, service, details } = req.body;
  if (!name || !email || !details) {
    return res
      .status(400)
      .json({ ok: false, error: "All required fields must be filled." });
  }
  const inquiries = await ensureFile(INQUIRIES_FILE, []);
  const entry = {
    id: `inq-${Date.now()}`,
    name: String(name).trim(),
    email: String(email).trim(),
    service: String(service || "Web Design").trim(),
    details: String(details).trim(),
    createdAt: new Date().toISOString(),
  };
  inquiries.unshift(entry);
  await fs.writeFile(INQUIRIES_FILE, JSON.stringify(inquiries, null, 2));
  res.status(201).json({
    ok: true,
    engine: "Node.js",
    message: "Inquiry received by Node.js server successfully.",
    inquiry: entry,
  });
});

app.listen(PORT, () => {
  console.log(`Node.js API running on http://localhost:${PORT}`);
});
