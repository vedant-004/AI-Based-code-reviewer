import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaUser, FaEnvelope, FaLock, FaCode } from "react-icons/fa";
import api from "../lib/api";

function Register({ onAuthSuccess, notify }) {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post("/auth/register", {
        name,
        email,
        password,
      });
      const tokenResponse = await api.post("/auth/login", {
        email,
        password,
      });
      onAuthSuccess(tokenResponse.data.token);
      localStorage.setItem("email", tokenResponse.data.email || email);
      notify("Account created successfully", "success");
      navigate("/dashboard");
    } catch (error) {
      const message = error.response?.data || "Registration failed";
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
        onSubmit={handleRegister}
        className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl"
      >
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-xl bg-indigo-500/20 p-2 text-indigo-300">
            <FaCode />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-white">Create account</h1>
            <p className="text-sm text-slate-400">Start your AI-assisted review workflow.</p>
          </div>
        </div>

        <label className="mb-3 block text-sm text-slate-300">Full Name</label>
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-white/10 bg-black/25 px-3">
          <FaUser className="text-slate-500" />
          <input
            className="w-full bg-transparent py-3 text-slate-100 outline-none"
            type="text"
            placeholder="John Doe"
            onChange={(e) => setName(e.target.value)}
            value={name}
            required
          />
        </div>

        <label className="mb-3 block text-sm text-slate-300">Email</label>
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-white/10 bg-black/25 px-3">
          <FaEnvelope className="text-slate-500" />
          <input
            className="w-full bg-transparent py-3 text-slate-100 outline-none"
            type="email"
            placeholder="you@example.com"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            required
          />
        </div>

        <label className="mb-3 block text-sm text-slate-300">Password</label>
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-white/10 bg-black/25 px-3">
          <FaLock className="text-slate-500" />
          <input
            className="w-full bg-transparent py-3 text-slate-100 outline-none"
            type="password"
            placeholder="Choose a secure password"
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            required
          />
        </div>

        {error && <p className="mb-3 text-sm text-rose-300">{error}</p>}

        <motion.button
          whileTap={{ scale: 0.98 }}
          disabled={loading}
          type="submit"
          className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-sky-500 py-3 font-semibold text-white shadow-lg transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Creating account..." : "Register"}
        </motion.button>

        <p className="mt-4 text-center text-sm text-slate-400">
          Already have an account?{" "}
          <Link className="text-indigo-300 hover:text-indigo-200" to="/login">
            Login
          </Link>
        </p>
      </motion.form>
    </div>
  );
}

export default Register;
