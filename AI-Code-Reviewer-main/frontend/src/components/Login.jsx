import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaEnvelope, FaLock, FaCode } from "react-icons/fa";
import api from "../lib/api";

function Login({ onAuthSuccess, notify }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      onAuthSuccess(data.token);
      localStorage.setItem("email", data.email || email);
      notify("Login successful", "success");
      navigate("/dashboard");
    } catch (err) {
      const message = err.response?.data || "Login failed";
      setError(String(message));
      notify(String(message), "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-4">
      <motion.form
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleLogin}
        className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl"
      >
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-xl bg-sky-500/20 p-2 text-sky-300">
            <FaCode />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-white">Welcome back</h1>
            <p className="text-sm text-slate-400">Sign in to continue reviewing code.</p>
          </div>
        </div>

        <label className="mb-3 block text-sm text-slate-300">Email</label>
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-white/10 bg-black/25 px-3">
          <FaEnvelope className="text-slate-500" />
          <input
            className="w-full bg-transparent py-3 text-slate-100 outline-none"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <label className="mb-3 block text-sm text-slate-300">Password</label>
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-white/10 bg-black/25 px-3">
          <FaLock className="text-slate-500" />
          <input
            className="w-full bg-transparent py-3 text-slate-100 outline-none"
            type="password"
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && <p className="mb-3 text-sm text-rose-300">{error}</p>}

        <motion.button
          whileTap={{ scale: 0.98 }}
          disabled={loading}
          className="w-full rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 py-3 font-semibold text-white shadow-lg transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          type="submit"
        >
          {loading ? "Signing in..." : "Login"}
        </motion.button>

        <p className="mt-4 text-center text-sm text-slate-400">
          No account?{" "}
          <Link className="text-sky-300 hover:text-sky-200" to="/register">
            Create one
          </Link>
        </p>
      </motion.form>
    </div>
  );
}

export default Login;
