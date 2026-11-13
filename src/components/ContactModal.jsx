import React, { useEffect, useState } from "react";
import { submitContactForm } from "../utils/api.js";

export default function ContactModal({
  isOpen,
  initialService,
  onClose,
  onSuccess,
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [service, setService] = useState(
    initialService || "Responsive Web Design",
  );
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    if (initialService) setService(initialService);
  }, [initialService]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback("");

    const res = await submitContactForm({ name, email, service, details });
    setSubmitting(false);

    if (res.ok) {
      setName("");
      setEmail("");
      setDetails("");
      onSuccess(
        `Inquiry sent (${res.engine || "API"})! Hamood will respond shortly.`,
      );
      onClose();
    } else {
      setFeedback(res.error || "Unable to submit inquiry.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-pitchBlack/90 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto bg-cardDark border border-accentCyan/50 rounded-2xl p-5 sm:p-10 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-softSilver hover:text-accentCyan text-2xl font-mono leading-none"
          aria-label="Close Modal"
        >
          &times;
        </button>

        <div className="space-y-2 mb-5">
          <div className="text-accentCyan text-[10px] sm:text-xs uppercase tracking-ultra font-semibold">
            <span>✧</span> Project Inquiry
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-titaniumWhite uppercase tracking-tight font-body">
            Start A Project
          </h3>
          <p className="text-xs text-softSilver">
            Send me your brief and let's craft something exceptional.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label
              htmlFor="clientName"
              className="block text-[10px] sm:text-[11px] uppercase tracking-wider text-titaniumWhite mb-1"
            >
              Your Name *
            </label>
            <input
              type="text"
              id="clientName"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-deepSpace border border-borderDark rounded-lg px-3 py-2 text-xs text-titaniumWhite focus:outline-none focus:border-accentCyan transition-colors"
              placeholder="e.g. John Doe"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label
                htmlFor="clientEmail"
                className="block text-[10px] sm:text-[11px] uppercase tracking-wider text-titaniumWhite mb-1"
              >
                Email Address *
              </label>
              <input
                type="email"
                id="clientEmail"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-deepSpace border border-borderDark rounded-lg px-3 py-2 text-xs text-titaniumWhite focus:outline-none focus:border-accentCyan transition-colors"
                placeholder="john@domain.com"
              />
            </div>

            <div>
              <label
                htmlFor="projectType"
                className="block text-[10px] sm:text-[11px] uppercase tracking-wider text-titaniumWhite mb-1"
              >
                Service Needed
              </label>
              <select
                id="projectType"
                value={service}
                onChange={(e) => setService(e.target.value)}
                className="w-full bg-deepSpace border border-borderDark rounded-lg px-3 py-2 text-xs text-titaniumWhite focus:outline-none focus:border-accentCyan transition-colors"
              >
                <option value="Responsive Web Design">
                  Responsive Web Design
                </option>
                <option value="Clean & Maintainable Code">
                  Clean &amp; Maintainable Code
                </option>
                <option value="Modern Web Development">
                  Modern Web Development
                </option>
                <option value="User-Friendly & Interactive Experiences">
                  User-Friendly &amp; Interactive Experiences
                </option>
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="projectDetails"
              className="block text-[10px] sm:text-[11px] uppercase tracking-wider text-titaniumWhite mb-1"
            >
              Project Details *
            </label>
            <textarea
              id="projectDetails"
              required
              rows="3"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="w-full bg-deepSpace border border-borderDark rounded-lg px-3 py-2 text-xs text-titaniumWhite focus:outline-none focus:border-accentCyan transition-colors"
              placeholder="Briefly describe your goals, budget, or timeline..."
            ></textarea>
          </div>

          {feedback && <p className="text-xs text-red-400">{feedback}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-gradient-to-r from-accentCyan to-accentBlue text-pitchBlack font-bold text-xs uppercase tracking-wider rounded-lg hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {submitting ? "Transmitting..." : "Transmit Inquiry"}
          </button>
        </form>
      </div>
    </div>
  );
}
