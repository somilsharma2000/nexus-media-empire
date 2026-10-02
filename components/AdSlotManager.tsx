"use client";

import React, { useEffect, useState, useCallback } from "react";

// ---- Types ----------------------------------------------------------------

export interface AdSlot {
  id: string;
  name: string;
  siteTargeting: "all" | "news" | "crypto" | "finance";
  placement: "header" | "inArticle" | "midFeed" | "sidebar" | "footer";
  type: "adsense" | "affiliate" | "direct" | "house";
  headline: string;
  description: string;
  ctaUrl: string;
  adCode: string;
  weight: number;
  priority: number;
  isActive: boolean;
  requiresDisclosure: boolean;
  frequencyCapPerUser: number;
}

const EMPTY_SLOT: Omit<AdSlot, "id"> = {
  name: "",
  siteTargeting: "all",
  placement: "midFeed",
  type: "house",
  headline: "",
  description: "",
  ctaUrl: "",
  adCode: "",
  weight: 1,
  priority: 1,
  isActive: true,
  requiresDisclosure: false,
  frequencyCapPerUser: 0,
};

// ---- Helpers ---------------------------------------------------------------

const badge = (label: string, color: string) => (
  <span
    className={`inline-block px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${color}`}
  >
    {label}
  </span>
);

const TYPE_COLORS: Record<string, string> = {
  adsense: "bg-yellow-900/40 text-yellow-400",
  affiliate: "bg-blue-900/40 text-blue-400",
  direct: "bg-purple-900/40 text-purple-400",
  house: "bg-gray-800 text-gray-300",
};

// ---- Ad Preview Card -------------------------------------------------------

function AdPreview({ slot }: { slot: Partial<AdSlot> }) {
  return (
    <div className="rounded-xl border border-gray-700 bg-gray-900 p-5 flex flex-col gap-2">
      {slot.requiresDisclosure && (
        <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
          — Sponsored —
        </span>
      )}
      <h4 className="text-white font-bold text-lg leading-tight">
        {slot.headline || <span className="text-gray-600 italic">Headline preview</span>}
      </h4>
      <p className="text-gray-400 text-sm">
        {slot.description || <span className="text-gray-700 italic">Description preview</span>}
      </p>
      {slot.ctaUrl && (
        <a
          href={slot.ctaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors"
        >
          Learn More →
        </a>
      )}
      <div className="mt-2 pt-2 border-t border-gray-800 flex gap-3 text-xs text-gray-600 flex-wrap">
        <span>Site: <strong className="text-gray-400">{slot.siteTargeting || "—"}</strong></span>
        <span>Placement: <strong className="text-gray-400">{slot.placement || "—"}</strong></span>
        <span>Type: <strong className="text-gray-400">{slot.type || "—"}</strong></span>
        <span>Weight: <strong className="text-gray-400">{slot.weight ?? "—"}</strong></span>
      </div>
    </div>
  );
}

// ---- Editor Modal ----------------------------------------------------------

interface EditorModalProps {
  initial: Partial<AdSlot>;
  onSave: (slot: Partial<AdSlot>) => Promise<void>;
  onClose: () => void;
  isNew: boolean;
}

function EditorModal({ initial, onSave, onClose, isNew }: EditorModalProps) {
  const [form, setForm] = useState<Partial<AdSlot>>(initial);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<"edit" | "preview">("edit");

  const set = (key: keyof AdSlot, value: unknown) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-gray-950 border border-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-800">
          <h2 className="text-white font-black text-lg">
            {isNew ? "New Ad Slot" : `Edit: ${initial.name}`}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-xl font-bold transition-colors">✕</button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-800">
          {(["edit", "preview"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-6 py-3 text-sm font-bold uppercase tracking-wider transition-colors ${
                tab === t ? "text-white border-b-2 border-blue-500" : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-4">
          {tab === "preview" ? (
            <AdPreview slot={form} />
          ) : (
            <form id="slot-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Field label="Name">
                <input required value={form.name || ""} onChange={(e) => set("name", e.target.value)}
                  className="input" placeholder="e.g. House – Mid Feed" />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Site Targeting">
                  <select value={form.siteTargeting || "all"} onChange={(e) => set("siteTargeting", e.target.value)} className="input">
                    {["all", "news", "crypto", "finance"].map((v) => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Placement">
                  <select value={form.placement || "midFeed"} onChange={(e) => set("placement", e.target.value)} className="input">
                    {["header", "inArticle", "midFeed", "sidebar", "footer"].map((v) => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </Field>
              </div>

              <Field label="Type">
                <select value={form.type || "house"} onChange={(e) => set("type", e.target.value)} className="input">
                  {["adsense", "affiliate", "direct", "house"].map((v) => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </Field>

              <Field label="Headline">
                <input value={form.headline || ""} onChange={(e) => set("headline", e.target.value)}
                  className="input" placeholder="e.g. Upgrade to Nexus Pro" />
              </Field>

              <Field label="Description">
                <textarea value={form.description || ""} onChange={(e) => set("description", e.target.value)}
                  className="input min-h-[80px] resize-y" placeholder="Short description shown under the headline" />
              </Field>

              <Field label="CTA URL">
                <input value={form.ctaUrl || ""} onChange={(e) => set("ctaUrl", e.target.value)}
                  className="input" placeholder="https://example.com" />
              </Field>

              <Field label="Ad Code (HTML/Script – optional)">
                <textarea value={form.adCode || ""} onChange={(e) => set("adCode", e.target.value)}
                  className="input font-mono text-xs min-h-[80px] resize-y" placeholder="<ins class='adsbygoogle' ...></ins>" />
              </Field>

              <div className="grid grid-cols-3 gap-4">
                <Field label="Weight">
                  <input type="number" min={1} value={form.weight ?? 1} onChange={(e) => set("weight", Number(e.target.value))}
                    className="input" />
                </Field>
                <Field label="Priority">
                  <input type="number" min={1} value={form.priority ?? 1} onChange={(e) => set("priority", Number(e.target.value))}
                    className="input" />
                </Field>
                <Field label="Freq. Cap / Session">
                  <input type="number" min={0} value={form.frequencyCapPerUser ?? 0}
                    onChange={(e) => set("frequencyCapPerUser", Number(e.target.value))} className="input" />
                </Field>
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input type="checkbox" checked={!!form.requiresDisclosure}
                    onChange={(e) => set("requiresDisclosure", e.target.checked)}
                    className="w-4 h-4 accent-blue-500" />
                  <span className="text-sm text-gray-300">Requires Disclosure</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input type="checkbox" checked={!!form.isActive}
                    onChange={(e) => set("isActive", e.target.checked)}
                    className="w-4 h-4 accent-blue-500" />
                  <span className="text-sm text-gray-300">Active</span>
                </label>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-800">
          <button onClick={onClose} className="px-5 py-2 rounded-lg border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 text-sm font-bold transition-colors">
            Cancel
          </button>
          <button
            form="slot-form"
            type="submit"
            disabled={saving}
            className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-colors disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save Slot"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
}

// ---- Main Component --------------------------------------------------------

export default function AdSlotManager() {
  const [slots, setSlots] = useState<AdSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [editSlot, setEditSlot] = useState<Partial<AdSlot> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [previewSlot, setPreviewSlot] = useState<AdSlot | null>(null);
  const [killPending, setKillPending] = useState(false);

  const fetchSlots = useCallback(async () => {
    try {
      const res = await fetch("/api/adslots");
      const data = await res.json();
      setSlots(data);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  const handleToggle = async (slot: AdSlot) => {
    const updated = { ...slot, isActive: !slot.isActive };
    await fetch("/api/adslots", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
    fetchSlots();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this ad slot?")) return;
    await fetch(`/api/adslots?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    fetchSlots();
  };

  const handleSave = async (slot: Partial<AdSlot>) => {
    if (isNew) {
      await fetch("/api/adslots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(slot),
      });
    } else {
      await fetch("/api/adslots", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(slot),
      });
    }
    fetchSlots();
  };

  const handleKillSwitch = async () => {
    if (!window.confirm("⚠️ KILL SWITCH: This will deactivate ALL ad slots immediately. Proceed?")) return;
    setKillPending(true);
    try {
      await fetch("/api/adslots/killswitch", { method: "PATCH" });
      fetchSlots();
    } finally {
      setKillPending(false);
    }
  };

  return (
    <div className="text-gray-200">
      {/* ---- Header ---- */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-black text-white">Ad Slot Manager</h2>
          <p className="text-sm text-gray-500 mt-1">{slots.length} slot{slots.length !== 1 ? "s" : ""} configured</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => { setIsNew(true); setEditSlot({ ...EMPTY_SLOT }); }}
            className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-colors"
          >
            + New Slot
          </button>
          <button
            onClick={handleKillSwitch}
            disabled={killPending}
            className="px-5 py-2 rounded-lg bg-red-700 hover:bg-red-600 text-white text-sm font-bold transition-colors disabled:opacity-50"
          >
            {killPending ? "Killing…" : "🔴 KILL SWITCH — Deactivate All Ads"}
          </button>
        </div>
      </div>

      {/* ---- Table ---- */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : slots.length === 0 ? (
        <div className="text-center py-16 text-gray-600 font-bold">No ad slots yet. Create one!</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-900 text-gray-400 text-xs uppercase tracking-wider">
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Site</th>
                <th className="px-4 py-3 text-left">Placement</th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Priority</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {slots.map((slot, i) => (
                <tr
                  key={slot.id}
                  className={`border-t border-gray-900 ${i % 2 === 0 ? "bg-gray-950" : "bg-black"} hover:bg-gray-900/60 transition-colors`}
                >
                  <td className="px-4 py-3 font-bold text-white">{slot.name}</td>
                  <td className="px-4 py-3">{badge(slot.siteTargeting, "bg-gray-800 text-gray-300")}</td>
                  <td className="px-4 py-3 text-gray-400">{slot.placement}</td>
                  <td className="px-4 py-3">{badge(slot.type, TYPE_COLORS[slot.type] || "bg-gray-800 text-gray-300")}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleToggle(slot)}
                      className={`relative inline-flex items-center w-11 h-6 rounded-full transition-colors focus:outline-none ${
                        slot.isActive ? "bg-green-600" : "bg-gray-700"
                      }`}
                      title={slot.isActive ? "Active — click to deactivate" : "Inactive — click to activate"}
                    >
                      <span
                        className={`inline-block w-4 h-4 bg-white rounded-full shadow transform transition-transform ${
                          slot.isActive ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-300 font-mono">{slot.priority}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => setPreviewSlot(slot)}
                        className="px-3 py-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-bold transition-colors"
                      >
                        Preview
                      </button>
                      <button
                        onClick={() => { setIsNew(false); setEditSlot(slot); }}
                        className="px-3 py-1 rounded bg-blue-900/40 hover:bg-blue-900/70 text-blue-400 text-xs font-bold transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(slot.id)}
                        className="px-3 py-1 rounded bg-red-900/30 hover:bg-red-900/60 text-red-400 text-xs font-bold transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ---- Inline Preview Pane ---- */}
      {previewSlot && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Preview: {previewSlot.name}</h3>
            <button onClick={() => setPreviewSlot(null)} className="text-gray-600 hover:text-white text-sm font-bold">✕ Close</button>
          </div>
          <AdPreview slot={previewSlot} />
        </div>
      )}

      {/* ---- Editor Modal ---- */}
      {editSlot && (
        <EditorModal
          initial={editSlot}
          onSave={handleSave}
          onClose={() => setEditSlot(null)}
          isNew={isNew}
        />
      )}

      {/* ---- Inline styles for input class ---- */}
      <style jsx>{`
        :global(.input) {
          width: 100%;
          background: #111;
          border: 1px solid #374151;
          border-radius: 0.5rem;
          padding: 0.5rem 0.75rem;
          color: #e5e7eb;
          font-size: 0.875rem;
          outline: none;
          transition: border-color 0.15s;
        }
        :global(.input:focus) {
          border-color: #3b82f6;
        }
      `}</style>
    </div>
  );
}
