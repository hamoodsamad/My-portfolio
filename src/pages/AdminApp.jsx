import React, { useCallback, useEffect, useState } from "react";
import ProjectCard from "../components/ProjectCard.jsx";
import ToastContainer from "../components/ToastContainer.jsx";
import {
  changeAdminPassword,
  createProject,
  fetchProjects,
  fileToCompressedDataUrl,
  removeProject,
  updateProject,
  verifyAdminPassword,
} from "../utils/api.js";

const SESSION_UNLOCK_KEY = "hs_admin_unlocked_v1";

const EMPTY_FORM = {
  title: "",
  category: "WEB DESIGN",
  description: "",
  image: "",
  link: "",
};

export default function AdminApp() {
  const [isUnlocked, setIsUnlocked] = useState(
    () => sessionStorage.getItem(SESSION_UNLOCK_KEY) === "1",
  );
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginShake, setLoginShake] = useState(false);
  const [checkingLogin, setCheckingLogin] = useState(false);

  const [projects, setProjects] = useState([]);
  const [engine, setEngine] = useState("Loading...");
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordFeedback, setPasswordFeedback] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  useEffect(() => {
    if (!isUnlocked) return;
    fetchProjects().then(({ projects: loaded, engine: activeEngine }) => {
      setProjects(loaded);
      setEngine(activeEngine);
    });
  }, [isUnlocked]);

  const handleUnlock = async (e) => {
    e.preventDefault();
    setCheckingLogin(true);
    setLoginError("");

    const res = await verifyAdminPassword(loginPassword);
    setCheckingLogin(false);

    if (res.ok) {
      sessionStorage.setItem(SESSION_UNLOCK_KEY, "1");
      setIsUnlocked(true);
      setLoginPassword("");
      addToast(`Admin Vault unlocked (${res.engine}).`);
    } else {
      setLoginError(res.error || "Wrong password. Please try again.");
      setLoginShake(true);
      setTimeout(() => setLoginShake(false), 450);
    }
  };

  const handleLockStudio = () => {
    sessionStorage.removeItem(SESSION_UNLOCK_KEY);
    setIsUnlocked(false);
    setLoginPassword("");
    setLoginError("");
  };

  const handlePasswordChangeSubmit = async (e) => {
    e.preventDefault();
    setPasswordFeedback("");

    if (newPassword.length < 4) {
      setPasswordFeedback("New password must be at least 4 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordFeedback("New password and confirmation do not match.");
      return;
    }

    setSavingPassword(true);
    const res = await changeAdminPassword(currentPassword, newPassword);
    setSavingPassword(false);

    if (res.ok) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordModalOpen(false);
      addToast(res.message || "Admin password updated successfully.");
    } else {
      setPasswordFeedback(res.error || "Could not update password.");
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await fileToCompressedDataUrl(file, 800);
      setForm((prev) => ({ ...prev, image: dataUrl }));
      addToast("Image compressed and loaded into preview.");
    } catch {
      addToast("Could not process that image file.", "error");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim() || !form.image.trim()) {
      addToast("Title, description, and image are required.", "error");
      return;
    }

    if (editingId) {
      const { projects: next, engine: activeEngine } = await updateProject(
        editingId,
        form,
      );
      setProjects(next);
      setEngine(activeEngine);
      setEditingId(null);
      setForm(EMPTY_FORM);
      addToast(`Project updated via ${activeEngine}.`);
    } else {
      const { projects: next, engine: activeEngine } =
        await createProject(form);
      setProjects(next);
      setEngine(activeEngine);
      setForm(EMPTY_FORM);
      addToast(`Project added via ${activeEngine}.`);
    }
  };

  const startEdit = (proj) => {
    setEditingId(proj.id);
    setForm({
      title: proj.title,
      category: proj.category,
      description: proj.description,
      image: proj.image,
      link: proj.link,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const { projects: next, engine: activeEngine } = await removeProject(
      deleteTarget.id,
    );
    setProjects(next);
    setEngine(activeEngine);
    addToast(`Deleted "${deleteTarget.title}" (${activeEngine}).`);
    setDeleteTarget(null);
  };

  const filteredProjects = projects.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
    );
  });

  /* ================= LOCKED SCREEN (PASSWORD GATE) ================= */
  if (!isUnlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <ToastContainer toasts={toasts} />

        <div
          className={`admin-glass-panel w-full max-w-md rounded-2xl p-7 sm:p-10 text-center space-y-6 ${
            loginShake ? "vault-shake" : ""
          }`}
        >
          <div className="vault-lock-badge mx-auto w-16 h-16 rounded-2xl border border-accentCyan/50 bg-deepSpace flex items-center justify-center text-accentCyan">
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>

          <div className="space-y-1.5">
            <p className="text-[10px] font-mono uppercase tracking-ultra text-accentCyan">
              Protected Access
            </p>
            <h1 className="text-2xl font-extrabold uppercase tracking-tight text-titaniumWhite">
              Admin Vault Locked
            </h1>
            <p className="text-xs text-softSilver/80">
              Enter your password to access Portfolio Studio.
            </p>
          </div>

          <form onSubmit={handleUnlock} className="space-y-4 text-left">
            <div>
              <label
                htmlFor="vaultPassword"
                className="block text-[11px] uppercase tracking-wider text-titaniumWhite mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="vaultPassword"
                  type={showLoginPass ? "text" : "password"}
                  required
                  autoFocus
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="admin-input pr-16"
                  placeholder="Enter admin password..."
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono uppercase text-accentCyan hover:underline"
                >
                  {showLoginPass ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {loginError && (
              <p className="text-xs text-red-400 font-medium">{loginError}</p>
            )}

            <button
              type="submit"
              disabled={checkingLogin}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-accentCyan to-accentBlue text-pitchBlack font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity shadow-lg shadow-accentCyan/20 disabled:opacity-60"
            >
              {checkingLogin ? "Verifying..." : "Unlock Admin Panel"}
            </button>
          </form>

          <div className="pt-2 border-t border-borderDark/70">
            <a
              href="./index.html"
              className="text-xs text-softSilver hover:text-accentCyan transition-colors"
            >
              ← Return to Portfolio
            </a>
          </div>
        </div>
      </div>
    );
  }

  /* ================= UNLOCKED ADMIN STUDIO ================= */
  return (
    <div className="min-h-screen flex flex-col">
      <ToastContainer toasts={toasts} />

      <header className="border-b border-borderDark/80 bg-pitchBlack/80 backdrop-blur-lg sticky top-0 z-30">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-10 lg:px-16 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg border border-accentCyan/50 bg-cardDark flex items-center justify-center">
              <span className="font-serif text-lg font-bold text-titaniumWhite">
                H<span className="text-accentCyan italic">S</span>
              </span>
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-extrabold uppercase tracking-wider text-titaniumWhite">
                Portfolio Project Studio
              </h1>
              <p className="text-[10px] font-mono uppercase tracking-widest text-accentCyan">
                Active Engine: {engine} &bull; {projects.length} Projects
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                setPasswordFeedback("");
                setPasswordModalOpen(true);
              }}
              className="px-4 py-2 rounded-full border border-borderDark bg-deepSpace hover:border-accentCyan text-xs text-titaniumWhite transition-colors"
            >
              Change Password
            </button>

            <button
              type="button"
              onClick={handleLockStudio}
              className="px-4 py-2 rounded-full border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-xs text-amber-300 transition-colors"
            >
              Lock Panel
            </button>

            <a
              href="./index.html"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-accentCyan to-accentBlue text-pitchBlack font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity"
            >
              ← Back to Live Portfolio
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-[1440px] w-full mx-auto px-4 sm:px-10 lg:px-16 py-8 sm:py-12 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 space-y-6">
            <div className="admin-glass-panel rounded-2xl p-6 sm:p-8">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-extrabold uppercase tracking-tight text-titaniumWhite">
                  {editingId ? "Edit Project" : "Add New Project"}
                </h2>
                {editingId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(null);
                      setForm(EMPTY_FORM);
                    }}
                    className="text-xs font-mono text-accentCyan hover:underline"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-titaniumWhite mb-1.5">
                    Project Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, title: e.target.value }))
                    }
                    className="admin-input"
                    placeholder="e.g. Nova SaaS Dashboard"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-titaniumWhite mb-1.5">
                      Category Tag *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.category}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          category: e.target.value,
                        }))
                      }
                      className="admin-input"
                      placeholder="E-COMMERCE / SAAS"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-titaniumWhite mb-1.5">
                      Project Click Link *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.link}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, link: e.target.value }))
                      }
                      className="admin-input"
                      placeholder="https://... or ./folder/index.html"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-titaniumWhite mb-1.5">
                    Project Short Details *
                  </label>
                  <textarea
                    rows="2"
                    required
                    value={form.description}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    className="admin-input"
                    placeholder="e.g. High-Converting Interactive Web App"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-titaniumWhite mb-1.5">
                    Image URL *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.image}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, image: e.target.value }))
                    }
                    className="admin-input"
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>

                <div className="admin-dropzone rounded-xl p-4 text-center">
                  <label className="cursor-pointer block">
                    <span className="text-xs font-semibold text-accentCyan block">
                      Or Upload Local Image File
                    </span>
                    <span className="text-[10px] text-softSilver/80">
                      Automatically compressed for fast loading
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-accentCyan to-accentBlue text-pitchBlack font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity shadow-lg shadow-accentCyan/20"
                >
                  {editingId ? "Save Changes" : "+ Publish to Portfolio"}
                </button>
              </form>
            </div>

            <div className="admin-glass-panel rounded-2xl p-6">
              <div className="text-[10px] uppercase tracking-ultra font-mono text-accentCyan mb-4">
                Live Marquee Card Preview
              </div>
              <div className="flex justify-center">
                <ProjectCard project={form} index={0} isPreview />
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 admin-glass-panel rounded-2xl p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-extrabold uppercase tracking-tight text-titaniumWhite">
                  Published Projects
                </h2>
                <p className="text-xs text-softSilver/80">
                  Changes sync directly with your portfolio marquee.
                </p>
              </div>
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects..."
                className="admin-input sm:max-w-[220px]"
              />
            </div>

            {filteredProjects.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-borderDark rounded-xl text-xs text-softSilver">
                No projects match your filter. Add one using the form!
              </div>
            ) : (
              <div className="space-y-4">
                {filteredProjects.map((proj, idx) => (
                  <div
                    key={proj.id}
                    className="admin-project-row rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <img
                        src={proj.image}
                        alt={proj.title}
                        className="w-20 h-16 object-cover rounded-lg border border-borderDark flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-xs font-bold text-accentCyan">
                            {String(idx + 1).padStart(2, "0")}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-pitchBlack border border-borderDark text-[9px] font-mono text-accentCyan uppercase">
                            {proj.category}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-titaniumWhite truncate">
                          {proj.title}
                        </h3>
                        <p className="text-xs text-softSilver/80 truncate">
                          {proj.description}
                        </p>
                        <p className="text-[10px] font-mono text-accentTeal truncate mt-0.5">
                          Link: {proj.link}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => startEdit(proj)}
                        className="px-3.5 py-1.5 rounded-lg border border-borderDark bg-deepSpace hover:border-accentCyan text-xs text-titaniumWhite transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(proj)}
                        className="px-3.5 py-1.5 rounded-lg border border-red-500/40 bg-red-500/10 hover:bg-red-500/20 text-xs text-red-300 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Change Password Modal */}
      {passwordModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pitchBlack/90 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="admin-glass-panel border border-accentCyan/40 rounded-2xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold uppercase text-titaniumWhite">
                Change Admin Password
              </h3>
              <button
                type="button"
                onClick={() => setPasswordModalOpen(false)}
                className="text-softSilver hover:text-accentCyan text-xl font-mono"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handlePasswordChangeSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-titaniumWhite mb-1">
                  Current Password *
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="admin-input"
                  placeholder="Enter current password"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-titaniumWhite mb-1">
                  New Password *
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="admin-input"
                  placeholder="Minimum 4 characters"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-titaniumWhite mb-1">
                  Confirm New Password *
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="admin-input"
                  placeholder="Re-enter new password"
                />
              </div>

              {passwordFeedback && (
                <p className="text-xs text-red-400">{passwordFeedback}</p>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setPasswordModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-borderDark text-xs text-softSilver hover:text-titaniumWhite"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="px-5 py-2 rounded-lg bg-gradient-to-r from-accentCyan to-accentBlue text-pitchBlack font-bold text-xs uppercase tracking-wider hover:opacity-90 disabled:opacity-60"
                >
                  {savingPassword ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pitchBlack/90 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-cardDark border border-red-500/40 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-titaniumWhite">
              Remove Project?
            </h3>
            <p className="text-xs text-softSilver leading-relaxed">
              Are you sure you want to delete{" "}
              <strong className="text-titaniumWhite">
                {deleteTarget.title}
              </strong>
              ? It will be removed from your portfolio marquee immediately.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-lg border border-borderDark text-xs text-softSilver hover:text-titaniumWhite"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 rounded-lg bg-red-500 text-white font-bold text-xs hover:bg-red-600"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
