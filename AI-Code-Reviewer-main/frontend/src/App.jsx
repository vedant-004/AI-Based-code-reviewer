import { useMemo, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import Analytics from "./components/Analytics";
import Toast from "./components/Toast";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [toasts, setToasts] = useState([]);

  const isAuthenticated = useMemo(() => Boolean(token), [token]);

  const notify = (message, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 2600);
  };

  const handleAuthSuccess = (nextToken) => {
    setToken(nextToken);
    localStorage.setItem("token", nextToken);
  };

  const logout = () => {
    setToken("");
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    notify("Logged out", "success");
  };

  return (
    <>
      <AnimatePresence mode="wait">
        <Routes>
          <Route
            path="/login"
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Login onAuthSuccess={handleAuthSuccess} notify={notify} />
              )
            }
          />
          <Route
            path="/register"
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Register onAuthSuccess={handleAuthSuccess} notify={notify} />
              )
            }
          />
          <Route
            path="/dashboard"
            element={
              isAuthenticated ? (
                <Dashboard onLogout={logout} notify={notify} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/analytics"
            element={isAuthenticated ? <Analytics notify={notify} /> : <Navigate to="/login" replace />}
          />
          <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
        </Routes>
      </AnimatePresence>
      <Toast toasts={toasts} />
    </>
  );
}

export default App;
