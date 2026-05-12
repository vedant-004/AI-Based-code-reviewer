import { AnimatePresence, motion } from "framer-motion";

function Toast({ toasts }) {
  return (
    <div className="pointer-events-none fixed right-4 top-4 z-50 space-y-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            className={`rounded-xl border px-4 py-3 text-sm shadow-xl backdrop-blur ${
              toast.type === "success"
                ? "border-emerald-400/40 bg-emerald-500/20 text-emerald-100"
                : "border-rose-400/40 bg-rose-500/20 text-rose-100"
            }`}
          >
            {toast.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export default Toast;
