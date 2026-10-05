"use client";

import React, { useEffect, useState, useCallback } from "react";
import { 
  Layers, 
  Plus, 
  Power, 
  Eye, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  X, 
  ExternalLink,
  ShieldAlert,
  Sparkles,
  Sliders,
  Clock
} from "lucide-react";

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

const TYPE_COLORS: Record<string, string> = {
  adsense: "bg-amber-950/60 text-amber-400 border border-amber-800/60",
  affiliate: "bg-blue-950/60 text-blue-400 border border-blue-800/60",
  direct: "bg-purple-950/60 text-purple-400 border border-purple-800/60",
  house: "bg-gray-800 text-gray-300 border border-gray-700",
};

// ---- Ad Preview Card -------------------------------------------------------

function AdPreview({ slot }: { slot: Partial<AdSlot> }) {
  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-950 p-6 flex flex-col gap-3 shadow-xl">
      {slot.requiresDisclosure && (
        <span className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">
          Sponsored Placement
        </span>
      )}
      <h4 className="text-white font-bold text-lg leading-tight">
        {slot.headline || <span className="text-gray-600 italic">Headline preview</span>}
      </h4>
      <p className="text-gray-400 text-xs leading-relaxed">
        {slot.description || <span className="text-gray-700 italic">Description preview</span>}
      </p>
      {slot.ctaUrl && (
        <div className="pt-2">
          <a
            href={slot.ctaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-blue-950"
          >
            Learn More <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}
      <div className="mt-3 pt-3 border-t border-gray-900 flex gap-4 text-xs font-mono text-gray-500 flex-wrap">
        <span>Site: <strong className="text-gray-300 uppercase">{slot.siteTargeting || "—"}</strong></span>
        <span>Placement: <strong className="text-gray-300">{slot.placement || "—"}</strong></span>
        <span>Type: <strong className="text-gray-300 uppercase">{slot.type || "—"}</strong></span>
        <span>Weight: <strong className="text-gray-300">{slot.weight ?? "—"}</strong></span>
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
  const [tab, setTab] = useState<"edit" | "preview">("edit");
  const [saving, setSaving] = useState(false);

  const set = (k: keyof AdSlot, v: any) => setForm((prev) => ({ ...prev, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-gray-950 border border-gray-800 rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-800">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-400" />
            {isNew ? "New Ad Slot" : `Edit Slot: ${initial.name || ""}`}
          </h3>
          <div className="flex items-center gap-2">
            <div className="flex bg-gray-900 rounded-lg p-0.5 border border-gray-800">
              <button
                type="button"
                onClick={() => setTab("edit")}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                  tab === "edit" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"
                }`}
              >
                Config
              </button>
              <button
                type="button"
                onClick={() => setTab("preview")}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                  tab === "preview" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"
                }`}
              >
                Preview
              </button>
            </div>
            <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-white rounded-lg">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {tab === "preview" ? (
            <AdPreview slot={form} />
          ) : (
            <form id="slot-form" onSubmit={handleSubmit} className="space-y-4 text-xs">
              <Field label="Slot Name *">
                <input
                  required
                  type="text"
                  value={form.name || ""}
                  onChange={(e) => set("name", e.target.value)}
                  className="w-full bg-black border border-gray-800 rounded-xl p-3 text-white focus:border-blue-500 outline-none"
                  placeholder="e.g. House — Mid Feed Crypto"
                />
              </Field>

              <div className="grid grid-cols-3 gap-4">
                <Field label="Site Targeting">
                  <select
                    value={form.siteTargeting || "all"}
                    onChange={(e) => set("siteTargeting", e.target.value)}
                    className="w-full bg-black border border-gray-800 rounded-xl p-3 text-white focus:border-blue-500 outline-none uppercase"
                  >
                    <option value="all">All Sites</option>
                    <option value="news">Tech & AI</option>
                    <option value="crypto">Crypto</option>
                    <option value="finance">Finance</option>
                  </select>
                </Field>

                <Field label="Placement">
                  <select
                    value={form.placement || "midFeed"}
                    onChange={(e) => set("placement", e.target.value)}
                    className="w-full bg-black border border-gray-800 rounded-xl p-3 text-white focus:border-blue-500 outline-none"
                  >
                    <option value="header">Header Banner</option>
                    <option value="inArticle">In-Article Top</option>
                    <option value="midFeed">Mid-Feed</option>
                    <option value="sidebar">Sidebar Unit</option>
                    <option value="footer">Footer Sticky</option>
                  </select>
                </Field>

                <Field label="Ad Unit Type">
                  <select
                    value={form.type || "house"}
                    onChange={(e) => set("type", e.target.value)}
                    className="w-full bg-black border border-gray-800 rounded-xl p-3 text-white focus:border-blue-500 outline-none uppercase"
                  >
                    <option value="adsense">AdSense</option>
                    <option value="affiliate">Affiliate</option>
                    <option value="direct">Direct Sponsor</option>
                    <option value="house">House Promo</option>
                  </select>
                </Field>
              </div>

              <Field label="Headline">
                <input
                  type="text"
                  value={form.headline || ""}
                  onChange={(e) => set("headline", e.target.value)}
                  className="w-full bg-black border border-gray-800 rounded-xl p-3 text-white focus:border-blue-500 outline-none"
                  placeholder="e.g. Automate Your Content Pipeline"
                />
              </Field>

              <Field label="Description / Subtext">
                <textarea
                  rows={2}
                  value={form.description || ""}
                  onChange={(e) => set("description", e.target.value)}
                  className="w-full bg-black border border-gray-800 rounded-xl p-3 text-white focus:border-blue-500 outline-none leading-relaxed"
                  placeholder="e.g. Generate 50+ articles monthly on complete autopilot..."
                />
              </Field>

              <Field label="CTA / Destination URL">
                <input
                  type="text"
                  value={form.ctaUrl || ""}
                  onChange={(e) => set("ctaUrl", e.target.value)}
                  className="w-full bg-black border border-gray-800 rounded-xl p-3 text-white focus:border-blue-500 outline-none font-mono"
                  placeholder="https://..."
                />
              </Field>

              <Field label="Raw Embed Code (AdSense / Native Tag)">
                <textarea
                  rows={2}
                  value={form.adCode || ""}
                  onChange={(e) => set("adCode", e.target.value)}
                  className="w-full bg-black border border-gray-800 rounded-xl p-3 text-gray-300 font-mono text-[11px] focus:border-blue-500 outline-none"
                  placeholder="<ins class='adsbygoogle' ...></ins>"
                />
              </Field>

              <div className="grid grid-cols-3 gap-4">
                <Field label="Weight (1-10)">
                  <input
                    type="number"
                    min={1}
                    value={form.weight ?? 1}
                    onChange={(e) => set("weight", Number(e.target.value))}
                    className="w-full bg-black border border-gray-800 rounded-xl p-3 text-white focus:border-blue-500 outline-none font-mono"
                  />
                </Field>
                <Field label="Priority (1-5)">
                  <input
                    type="number"
                    min={1}
                    value={form.priority ?? 1}
                    onChange={(e) => set("priority", Number(e.target.value))}
                    className="w-full bg-black border border-gray-800 rounded-xl p-3 text-white focus:border-blue-500 outline-none font-mono"
                  />
                </Field>
                <Field label="Freq. Cap / Session">
                  <input
                    type="number"
                    min={0}
                    value={form.frequencyCapPerUser ?? 0}
                    onChange={(e) => set("frequencyCapPerUser", Number(e.target.value))}
                    className="w-full bg-black border border-gray-800 rounded-xl p-3 text-white focus:border-blue-500 outline-none font-mono"
                  />
                </Field>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={!!form.requiresDisclosure}
                    onChange={(e) => set("requiresDisclosure", e.target.checked)}
                    className="w-4 h-4 accent-blue-500 rounded"
                  />
                  <span className="text-gray-300">Requires Sponsor Disclosure</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={!!form.isActive}
                    onChange={(e) => set("isActive", e.target.checked)}
                    className="w-4 h-4 accent-blue-500 rounded"
                  />
                  <span className="text-gray-300">Active</span>
                </label>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-800">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-gray-800 text-gray-400 hover:text-white hover:bg-gray-900 font-bold transition-all text-xs"
          >
            Cancel
          </button>
          <button
            form="slot-form"
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-lg shadow-blue-950 text-xs disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save Ad Slot"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{label}</label>
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
      setLoading(true);
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
    if (!confirm("Remove this ad slot?")) return;
    await fetch(`/api/adslots?id=${id}`, { method: "DELETE" });
    fetchSlots();
  };

  const handleSave = async (slotData: Partial<AdSlot>) => {
    const method = isNew ? "POST" : "PUT";
    await fetch("/api/adslots", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(slotData),
    });
    setEditSlot(null);
    fetchSlots();
  };

  const handleKillSwitch = async () => {
    if (!confirm("EMERGENCY KILL SWITCH: Deactivate ALL ad units network-wide?")) return;
    setKillPending(true);
    try {
      await fetch("/api/adslots/killswitch", { method: "PATCH" });
      await fetchSlots();
    } finally {
      setKillPending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-wrap justify-between items-center gap-4 bg-gray-900/40 border border-gray-800 p-5 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-950/60 border border-blue-800/60 rounded-xl text-blue-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Network Ad Units</h3>
            <p className="text-xs text-gray-500 font-mono">{slots.length} units configured across all publications</p>
          </div>
        </div>

        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => { setIsNew(true); setEditSlot({ ...EMPTY_SLOT }); }}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg shadow-blue-950"
          >
            <Plus className="w-4 h-4" /> New Ad Slot
          </button>
          <button
            onClick={handleKillSwitch}
            disabled={killPending}
            className="px-4 py-2.5 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-800 text-red-300 text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg shadow-red-950/50 disabled:opacity-50"
          >
            <Power className="w-4 h-4 text-red-400" />
            {killPending ? "Deactivating…" : "Kill Switch (Deactivate All)"}
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : slots.length === 0 ? (
        <div className="text-center py-16 bg-gray-900/30 border border-gray-800 rounded-2xl text-gray-500 text-xs">
          No ad slots configured yet. Click &quot;New Ad Slot&quot; to create one.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-800 bg-gray-950">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-900/80 text-gray-400 text-[10px] uppercase font-bold tracking-wider border-b border-gray-800">
                <th className="px-5 py-3.5 text-left">Slot Name</th>
                <th className="px-5 py-3.5 text-left">Site Scope</th>
                <th className="px-5 py-3.5 text-left">Placement</th>
                <th className="px-5 py-3.5 text-left">Type</th>
                <th className="px-5 py-3.5 text-center">Status</th>
                <th className="px-5 py-3.5 text-center">Priority</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-850">
              {slots.map((slot) => (
                <tr
                  key={slot.id}
                  className="hover:bg-gray-900/50 transition-colors"
                >
                  <td className="px-5 py-4 font-bold text-white">{slot.name}</td>
                  <td className="px-5 py-4">
                    <span className="px-2 py-0.5 rounded bg-gray-800 text-gray-300 uppercase font-mono text-[10px]">
                      {slot.siteTargeting}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-gray-400 font-mono">{slot.placement}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2 py-0.5 rounded uppercase font-mono text-[10px] ${TYPE_COLORS[slot.type] || "bg-gray-800 text-gray-300"}`}>
                      {slot.type}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <button
                      onClick={() => handleToggle(slot)}
                      className={`relative inline-flex items-center w-10 h-5 rounded-full transition-all focus:outline-none ${
                        slot.isActive ? "bg-emerald-600 shadow-md shadow-emerald-950" : "bg-gray-800"
                      }`}
                    >
                      <span
                        className={`inline-block w-3.5 h-3.5 bg-white rounded-full transition-transform ${
                          slot.isActive ? "translate-x-5" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </td>
                  <td className="px-5 py-4 text-center text-gray-400 font-mono">{slot.priority}</td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setPreviewSlot(slot)}
                        className="p-1.5 rounded-lg bg-gray-900 hover:bg-gray-800 text-gray-300 border border-gray-800 transition-colors"
                        title="Preview Slot"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => { setIsNew(false); setEditSlot(slot); }}
                        className="p-1.5 rounded-lg bg-blue-950/50 hover:bg-blue-900 text-blue-400 border border-blue-800/50 transition-colors"
                        title="Edit Slot"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(slot.id)}
                        className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900 text-red-400 border border-red-800/40 transition-colors"
                        title="Delete Slot"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Inline Preview Modal */}
      {previewSlot && (
        <div className="bg-gray-900/40 border border-gray-800 p-6 rounded-2xl space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-blue-400" />
              Live Preview: {previewSlot.name}
            </h4>
            <button onClick={() => setPreviewSlot(null)} className="text-gray-500 hover:text-white text-xs">
              Close Preview
            </button>
          </div>
          <AdPreview slot={previewSlot} />
        </div>
      )}

      {/* Editor Modal */}
      {editSlot && (
        <EditorModal
          initial={editSlot}
          onSave={handleSave}
          onClose={() => setEditSlot(null)}
          isNew={isNew}
        />
      )}
    </div>
  );
}
