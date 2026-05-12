import { motion } from "framer-motion";
import { FaEdit, FaTrash, FaCode } from "react-icons/fa";

function Sidebar({
  pastReviews,
  selectedReview,
  onSelect,
  onEdit,
  onDelete,
  onNewReview,
}) {
  return (
    <aside className="w-full lg:w-80 shrink-0 rounded-2xl border border-white/10 bg-slate-900/60 p-4 shadow-2xl backdrop-blur-xl">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
          Review History
        </h2>
        <button
          onClick={onNewReview}
          className="rounded-lg bg-sky-500/20 px-3 py-1 text-xs font-semibold text-sky-300 transition hover:bg-sky-500/30"
        >
          New
        </button>
      </div>

      <div className="max-h-[65vh] space-y-2 overflow-y-auto pr-1">
        {pastReviews.length === 0 && (
          <p className="rounded-xl border border-dashed border-white/10 p-4 text-sm text-slate-400">
            No reviews yet. Submit code to start building history.
          </p>
        )}

        {pastReviews.map((item) => {
          const isActive = selectedReview?.id === item.id;
          return (
            <motion.div
              key={item.id}
              whileHover={{ y: -2 }}
              className={`group rounded-xl border p-3 transition ${
                isActive
                  ? "border-sky-400/50 bg-sky-500/10"
                  : "border-white/10 bg-white/5 hover:border-white/20"
              }`}
            >
              <button
                onClick={() => onSelect(item)}
                className="w-full text-left"
              >
                <div className="mb-2 flex items-center gap-2 text-xs text-slate-400">
                  <FaCode />
                  <span>{new Date(item.createdAt).toLocaleString()}</span>
                </div>
                <p className="line-clamp-2 text-sm text-slate-100">
                  {item.code}
                </p>
              </button>

              <div className="mt-3 flex gap-2 opacity-70 transition group-hover:opacity-100">
                <button
                  onClick={() => onEdit(item)}
                  className="rounded-lg bg-amber-500/15 p-2 text-amber-300 hover:bg-amber-500/25"
                  title="Edit review"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => onDelete(item.id)}
                  className="rounded-lg bg-rose-500/15 p-2 text-rose-300 hover:bg-rose-500/25"
                  title="Delete review"
                >
                  <FaTrash />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </aside>
  );
}

export default Sidebar;
