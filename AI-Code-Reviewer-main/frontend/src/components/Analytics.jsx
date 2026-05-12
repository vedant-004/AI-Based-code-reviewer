import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaArrowLeft, FaChartLine, FaListUl } from "react-icons/fa";
import api from "../lib/api";

function Analytics({ notify }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    totalReviews: 0,
    averageScore: 0,
    latestReviews: [],
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const { data } = await api.get("/ai/analytics");
        setAnalytics(data);
      } catch (error) {
        notify("Failed to load analytics", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [notify]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-4 text-slate-100 lg:p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-5 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Analytics</h1>
          <button
            onClick={() => navigate("/dashboard")}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
          >
            <span className="inline-flex items-center gap-2"><FaArrowLeft /> Back</span>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <motion.div whileHover={{ y: -2 }} className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur">
            <p className="mb-1 text-sm text-slate-400">Total Reviews</p>
            <div className="inline-flex items-center gap-2 text-3xl font-bold">
              <FaListUl className="text-sky-400" />
              {analytics.totalReviews}
            </div>
          </motion.div>

          <motion.div whileHover={{ y: -2 }} className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur">
            <p className="mb-1 text-sm text-slate-400">Average Score</p>
            <div className="inline-flex items-center gap-2 text-3xl font-bold">
              <FaChartLine className="text-emerald-400" />
              {Number(analytics.averageScore || 0).toFixed(2)} / 10
            </div>
          </motion.div>
        </div>

        <section className="mt-5 rounded-2xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur">
          <h2 className="mb-3 text-lg font-semibold">Recent Activity</h2>
          {loading ? (
            <p className="text-slate-400">Loading analytics...</p>
          ) : analytics.latestReviews.length === 0 ? (
            <p className="text-slate-400">No reviews available.</p>
          ) : (
            <div className="space-y-3">
              {analytics.latestReviews.map((item) => (
                <div key={item.id} className="rounded-xl border border-white/10 bg-black/20 p-3">
                  <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
                    <span>{new Date(item.createdAt).toLocaleString()}</span>
                    <span>Score: {Number(item.score || 0).toFixed(1)}</span>
                  </div>
                  <p className="line-clamp-2 text-sm text-slate-100">{item.code}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default Analytics;
