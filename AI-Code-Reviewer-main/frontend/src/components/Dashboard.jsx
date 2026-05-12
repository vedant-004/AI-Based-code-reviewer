import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Editor from "react-simple-code-editor";
import prism from "prismjs";
import "prismjs/components/prism-javascript";
import "prismjs/themes/prism-tomorrow.css";
import { FaCopy, FaPlay, FaUpload, FaSignOutAlt, FaChartLine, FaRobot } from "react-icons/fa";
import api from "../lib/api";
import Sidebar from "./Sidebar";
import ReviewCard from "./ReviewCard";

function Dashboard({ onLogout, notify }) {
  const navigate = useNavigate();
  const [code, setCode] = useState("function sum(a, b) {\n  return a + b;\n}");
  const [previousCode, setPreviousCode] = useState("");
  const [review, setReview] = useState("");
  const [structuredReview, setStructuredReview] = useState(null);
  const [score, setScore] = useState(0);
  const [pastReviews, setPastReviews] = useState([]);
  const [selectedReview, setSelectedReview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [compareChanges, setCompareChanges] = useState(false);
  const [mode, setMode] = useState("developer");

  const lineNumbers = useMemo(
    () =>
      code.split("\n").map((_, idx) => (
        <div key={`line-${idx + 1}`} className="h-[21px] text-right text-xs text-slate-500">
          {idx + 1}
        </div>
      )),
    [code]
  );

  const fetchPastReviews = async () => {
    try {
      const response = await api.get("/ai/past-prompts");
      setPastReviews(response.data);
    } catch (error) {
      notify("Error fetching past reviews", "error");
      console.error(error);
    }
  };

  useEffect(() => {
    fetchPastReviews();
  }, []);

  const analyzeCode = async () => {
    setLoading(true);
    try {
      const response = await api.post("/ai/get-review", {
        code,
        previousCode: previousCode || undefined,
        compareChanges,
        mode,
      });
      const data = response.data;
      setSelectedReview(data);
      setReview(data.review || "");
      setStructuredReview(typeof data.structuredReview === "object" ? data.structuredReview : null);
      setScore(Number(data.score || 0));
      setMode(data.mode || mode);
      await fetchPastReviews();
      notify("Code analyzed successfully", "success");
    } catch (error) {
      notify(error.response?.data?.message || "Failed to analyze code", "error");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const updateReview = async (id) => {
    setLoading(true);
    try {
      const response = await api.put(`/ai/past-prompts/${id}`, {
        code,
        previousCode: previousCode || undefined,
        compareChanges,
        mode,
      });
      const data = response.data;
      setReview(data.review || "");
      setStructuredReview(typeof data.structuredReview === "object" ? data.structuredReview : null);
      setScore(Number(data.score || 0));
      setMode(data.mode || mode);
      setSelectedReview(data);
      await fetchPastReviews();
      notify("Review updated", "success");
    } catch (error) {
      notify(error.response?.data?.message || "Error updating review", "error");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const deleteReview = async (id) => {
    try {
      await api.delete(`/ai/past-prompts/${id}`);
      if (selectedReview?.id === id) {
        setSelectedReview(null);
        setReview("");
        setStructuredReview(null);
        setScore(0);
      }
      await fetchPastReviews();
      notify("Review deleted", "success");
    } catch (error) {
      notify("Error deleting review", "error");
      console.error(error);
    }
  };

  const selectReview = (item) => {
    setSelectedReview(item);
    setCode(item.newCode || item.code || "");
    setPreviousCode(item.oldCode || item.previousCode || "");
    setReview(item.review || "");
    setStructuredReview(typeof item.structuredReview === "object" ? item.structuredReview : null);
    setScore(Number(item.score || 0));
    setCompareChanges(Boolean(item.compareChanges));
    setMode(item.mode || "developer");
  };

  const startNewReview = () => {
    setSelectedReview(null);
    setCode("");
    setPreviousCode("");
    setReview("");
    setStructuredReview(null);
    setScore(0);
    setCompareChanges(false);
    setMode("developer");
  };

  const copyCode = async () => {
    await navigator.clipboard.writeText(code);
    notify("Code copied", "success");
  };

  const uploadCodeFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const isAllowed = file.name.endsWith(".js") || file.name.endsWith(".py");
    if (!isAllowed) {
      notify("Only .js and .py files are allowed", "error");
      return;
    }
    const content = await file.text();
    setCode(content);
    notify("File loaded into editor", "success");
  };

  const userInitial = (localStorage.getItem("email") || "D")[0].toUpperCase();

  const diffData = useMemo(() => {
    if (!compareChanges || !previousCode.trim()) {
      return { added: [], removed: [] };
    }
    const prevLines = previousCode.split("\n");
    const currLines = code.split("\n");
    const prevSet = new Set(prevLines);
    const currSet = new Set(currLines);
    const added = currLines.filter((line) => line.trim() && !prevSet.has(line));
    const removed = prevLines.filter((line) => line.trim() && !currSet.has(line));
    return { added, removed };
  }, [code, previousCode, compareChanges]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-4 py-5 text-slate-100 lg:px-6">
      <nav className="mb-5 flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 shadow-2xl backdrop-blur-xl">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">AI Assisted</p>
          <h1 className="text-xl font-semibold">Code Review Studio</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/analytics")}
            className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
          >
            <span className="inline-flex items-center gap-2"><FaChartLine /> Analytics</span>
          </button>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-500/25 text-sm font-semibold text-sky-200">
            {userInitial}
          </div>
          <button
            onClick={onLogout}
            className="rounded-xl bg-rose-500/20 px-4 py-2 text-sm text-rose-200 hover:bg-rose-500/30"
          >
            <span className="inline-flex items-center gap-2"><FaSignOutAlt /> Logout</span>
          </button>
        </div>
      </nav>

      <div className="flex flex-col gap-5 lg:flex-row">
        <Sidebar
          pastReviews={pastReviews}
          selectedReview={selectedReview}
          onSelect={selectReview}
          onEdit={selectReview}
          onDelete={deleteReview}
          onNewReview={startNewReview}
        />

        <main className="flex-1 space-y-5">
          <motion.section
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 shadow-2xl backdrop-blur-xl"
          >
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div className="inline-flex items-center gap-2 text-sm text-slate-300">
                <FaRobot className="text-sky-400" />
                Source Code Input
              </div>
              <div className="flex flex-wrap gap-2">
                <label className="cursor-pointer rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs hover:bg-white/10">
                  <span className="inline-flex items-center gap-2"><FaUpload /> Upload .js/.py</span>
                  <input type="file" accept=".js,.py" className="hidden" onChange={uploadCodeFile} />
                </label>
                <button
                  onClick={copyCode}
                  className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs hover:bg-white/10"
                >
                  <span className="inline-flex items-center gap-2"><FaCopy /> Copy</span>
                </button>
              </div>
            </div>

            <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2">
              <label className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm">
                <span>Compare Changes</span>
                <input
                  type="checkbox"
                  checked={compareChanges}
                  onChange={(e) => setCompareChanges(e.target.checked)}
                  className="h-4 w-4 accent-sky-500"
                />
              </label>
              <label className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm">
                <span>Beginner Mode</span>
                <input
                  type="checkbox"
                  checked={mode === "beginner"}
                  onChange={(e) => setMode(e.target.checked ? "beginner" : "developer")}
                  className="h-4 w-4 accent-indigo-500"
                />
              </label>
            </div>

            <div className="mb-4">
              <label className="mb-2 block text-xs uppercase tracking-wide text-slate-400">Previous Code (optional)</label>
              <textarea
                value={previousCode}
                onChange={(e) => setPreviousCode(e.target.value)}
                placeholder="Paste previous version to compare changes..."
                className="h-24 w-full rounded-xl border border-white/10 bg-black/30 p-3 font-mono text-xs text-slate-200 outline-none focus:border-sky-400/40"
              />
            </div>

            <div className="overflow-hidden rounded-xl border border-white/10 bg-black/35">
              <div className="flex">
                <div className="min-w-[52px] border-r border-white/10 px-2 py-3">{lineNumbers}</div>
                <div className="w-full overflow-auto">
                  <Editor
                    value={code}
                    onValueChange={setCode}
                    highlight={(value) => prism.highlight(value, prism.languages.javascript, "javascript")}
                    padding={12}
                    textareaId="editor"
                    style={{
                      fontFamily: "JetBrains Mono, Fira Code, monospace",
                      fontSize: 14,
                      minHeight: "260px",
                      color: "#e2e8f0",
                      backgroundColor: "transparent",
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-4">
              <motion.button
                whileTap={{ scale: 0.98 }}
                disabled={loading || !code.trim()}
                onClick={() => (selectedReview ? updateReview(selectedReview.id) : analyzeCode())}
                className="rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 px-5 py-2.5 font-semibold text-white shadow-lg transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="inline-flex items-center gap-2">
                  <FaPlay />
                  {loading ? "Analyzing..." : selectedReview ? "Update Analysis" : "Analyze Code"}
                </span>
              </motion.button>
            </div>
          </motion.section>

          {compareChanges && previousCode.trim() && (
            <motion.section
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 shadow-2xl backdrop-blur-xl"
            >
              <h3 className="mb-3 text-sm font-semibold text-slate-200">Code Changes (PR View)</h3>
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-3">
                  <p className="mb-2 text-sm font-semibold text-emerald-200">Added Lines</p>
                  <ul className="max-h-48 space-y-1 overflow-auto font-mono text-xs text-emerald-100">
                    {diffData.added.length ? diffData.added.map((line, idx) => <li key={`a-${idx}`}>+ {line}</li>) : <li>No added lines</li>}
                  </ul>
                </div>
                <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 p-3">
                  <p className="mb-2 text-sm font-semibold text-rose-200">Removed Lines</p>
                  <ul className="max-h-48 space-y-1 overflow-auto font-mono text-xs text-rose-100">
                    {diffData.removed.length ? diffData.removed.map((line, idx) => <li key={`r-${idx}`}>- {line}</li>) : <li>No removed lines</li>}
                  </ul>
                </div>
              </div>
            </motion.section>
          )}

          {(review || structuredReview) && (
            <ReviewCard
              review={review}
              structuredReview={structuredReview}
              score={score}
              mode={mode}
              compareChanges={compareChanges}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
