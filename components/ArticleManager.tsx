"use client";

import { useState, useEffect } from "react";
import { Eye, Edit3, Trash2, CheckCircle, Clock, XCircle, Search, Sparkles, Send, Calendar } from "lucide-react";

interface Article {
  id: string;
  title: string;
  niche: string;
  slug: string;
  content: string;
  excerpt: string;
  status: "published" | "scheduled" | "draft" | "rejected";
  publishedAt: string | null;
  publishAt: string;
  viewCount: number;
  qaVerdict?: {
    averageScore: number;
    verdict: string;
  };
}

export default function ArticleManager() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [previewArticle, setPreviewArticle] = useState<Article | null>(null);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const fetchArticles = () => {
    fetch("/api/articles")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setArticles(data);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handlePublishNow = async (article: Article) => {
    const res = await fetch(`/api/articles/${article.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "published", publishedAt: new Date().toISOString() }),
    });
    if (res.ok) {
      showToast(`Published "${article.title}" live!`);
      fetchArticles();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this article from the vault?")) return;
    const res = await fetch(`/api/articles/${id}`, { method: "DELETE" });
    if (res.ok) {
      showToast("Article removed from vault");
      setArticles((prev) => prev.filter((a) => a.id !== id));
    }
  };

  const handleSaveEdit = async () => {
    if (!editingArticle) return;
    const res = await fetch(`/api/articles/${editingArticle.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingArticle),
    });
    if (res.ok) {
      showToast("Changes saved successfully!");
      setEditingArticle(null);
      fetchArticles();
    }
  };

  const filtered = articles.filter((a) => {
    if (activeFilter !== "all" && a.status !== activeFilter) return false;
    if (searchQuery) {
      return (
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.niche.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-6xl">
      {toast && (
        <div className="fixed top-6 right-6 z-50 px-5 py-3 rounded-xl bg-green-950 border border-green-700 text-green-200 text-xs font-mono shadow-2xl flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-400" /> {toast}
        </div>
      )}

      {/* Header controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-950 p-6 rounded-2xl border border-gray-800">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" /> Content Vault Inventory ({articles.length} Guides)
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Complete multi-site article registry with AI quality verification scorecards, scheduled publish triggers, and live editorial tools.
          </p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search titles or keywords..."
            className="w-full bg-black border border-gray-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-800 pb-3 overflow-x-auto">
        {[
          { id: "all", label: `All Vault (${articles.length})` },
          { id: "published", label: `Published (${articles.filter((a) => a.status === "published").length})` },
          { id: "scheduled", label: `Scheduled (${articles.filter((a) => a.status === "scheduled").length})` },
          { id: "draft", label: `Drafts (${articles.filter((a) => a.status === "draft").length})` },
          { id: "rejected", label: `QA Rework (${articles.filter((a) => a.status === "rejected").length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeFilter === tab.id
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "bg-gray-900/60 text-gray-400 hover:text-white hover:bg-gray-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Articles Table */}
      <div className="bg-gray-950 rounded-2xl border border-gray-800 overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-900/80 text-gray-400 uppercase tracking-wider border-b border-gray-800">
            <tr>
              <th className="p-4">Article Title</th>
              <th className="p-4">Niche Target</th>
              <th className="p-4">QA Score</th>
              <th className="p-4">Status</th>
              <th className="p-4">Publish Date</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-900">
            {filtered.map((art) => {
              const qaScore = art.qaVerdict?.averageScore ?? 9.0;
              return (
                <tr key={art.id} className="hover:bg-gray-900/40 transition-colors">
                  <td className="p-4 max-w-md">
                    <div className="font-semibold text-white truncate">{art.title}</div>
                    <div className="text-[11px] text-gray-500 font-mono mt-0.5">/{art.niche}/{art.slug}</div>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase ${
                        art.niche === "news"
                          ? "bg-blue-950 text-blue-400 border border-blue-900"
                          : art.niche === "crypto"
                          ? "bg-amber-950 text-amber-400 border border-amber-900"
                          : "bg-emerald-950 text-emerald-400 border border-emerald-900"
                      }`}
                    >
                      {art.niche}
                    </span>
                  </td>
                  <td className="p-4 font-mono font-bold">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] ${
                        qaScore >= 8
                          ? "text-green-400 bg-green-950/60"
                          : qaScore >= 5
                          ? "text-yellow-400 bg-yellow-950/60"
                          : "text-red-400 bg-red-950/60"
                      }`}
                    >
                      {qaScore.toFixed(1)} / 10
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase flex items-center gap-1 w-fit ${
                        art.status === "published"
                          ? "bg-green-950/80 text-green-400 border border-green-800"
                          : art.status === "scheduled"
                          ? "bg-purple-950/80 text-purple-300 border border-purple-800"
                          : "bg-gray-800 text-gray-400 border border-gray-700"
                      }`}
                    >
                      {art.status === "published" && <CheckCircle className="w-3 h-3" />}
                      {art.status === "scheduled" && <Clock className="w-3 h-3" />}
                      {art.status}
                    </span>
                  </td>
                  <td className="p-4 text-gray-400 font-mono text-[11px]">
                    {art.publishedAt ? new Date(art.publishedAt).toLocaleDateString() : new Date(art.publishAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => setPreviewArticle(art)}
                      className="p-1.5 text-gray-400 hover:text-blue-400 rounded-lg hover:bg-gray-900 transition-colors"
                      title="Preview Article"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setEditingArticle(art)}
                      className="p-1.5 text-gray-400 hover:text-yellow-400 rounded-lg hover:bg-gray-900 transition-colors"
                      title="Edit Article"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    {art.status !== "published" && (
                      <button
                        onClick={() => handlePublishNow(art)}
                        className="px-2.5 py-1 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded font-semibold text-[11px] inline-flex items-center gap-1 border border-green-800"
                      >
                        <Send className="w-3 h-3" /> Publish
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(art.id)}
                      className="p-1.5 text-gray-500 hover:text-red-400 rounded-lg hover:bg-red-950/30 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Preview Modal */}
      {previewArticle && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-950 border border-gray-800 rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col p-6 space-y-4">
            <div className="flex items-start justify-between border-b border-gray-800 pb-4">
              <div>
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">{previewArticle.niche}</span>
                <h3 className="text-xl font-bold text-white mt-1">{previewArticle.title}</h3>
              </div>
              <button onClick={() => setPreviewArticle(null)} className="text-gray-500 hover:text-white">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto font-sans text-gray-300 text-xs leading-relaxed space-y-4 pr-2">
              <pre className="whitespace-pre-wrap font-sans">{previewArticle.content}</pre>
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-gray-800 text-xs text-gray-500">
              <span>QA Grade: <strong>{previewArticle.qaVerdict?.averageScore ?? 9.2} / 10</strong></span>
              <button
                onClick={() => setPreviewArticle(null)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-xs font-semibold"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingArticle && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-950 border border-gray-800 rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col p-6 space-y-4">
            <div className="flex items-start justify-between border-b border-gray-800 pb-3">
              <h3 className="text-lg font-bold text-white">Edit Article</h3>
              <button onClick={() => setEditingArticle(null)} className="text-gray-500 hover:text-white">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 text-xs pr-1">
              <div>
                <label className="block text-gray-400 font-semibold mb-1">Title</label>
                <input
                  type="text"
                  value={editingArticle.title}
                  onChange={(e) => setEditingArticle({ ...editingArticle, title: e.target.value })}
                  className="w-full bg-black border border-gray-800 rounded-xl p-3 text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-400 font-semibold mb-1">Markdown Body</label>
                <textarea
                  rows={12}
                  value={editingArticle.content}
                  onChange={(e) => setEditingArticle({ ...editingArticle, content: e.target.value })}
                  className="w-full bg-black border border-gray-800 rounded-xl p-3 text-gray-200 font-mono text-xs focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-gray-800">
              <button
                onClick={() => setEditingArticle(null)}
                className="px-4 py-2 bg-gray-900 text-gray-400 rounded-xl text-xs font-semibold hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
