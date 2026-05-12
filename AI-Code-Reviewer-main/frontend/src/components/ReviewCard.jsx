import { motion } from "framer-motion";
import { FaBug, FaLightbulb, FaCheckCircle, FaAlignLeft } from "react-icons/fa";

const sectionStyles = {
  bugs: {
    title: "Bugs",
    icon: <FaBug />,
    classes: "border-rose-400/30 bg-rose-500/10 text-rose-100",
  },
  improvements: {
    title: "Improvements",
    icon: <FaLightbulb />,
    classes: "border-amber-400/30 bg-amber-500/10 text-amber-100",
  },
  goodPractices: {
    title: "Good Practices",
    icon: <FaCheckCircle />,
    classes: "border-emerald-400/30 bg-emerald-500/10 text-emerald-100",
  },
  summary: {
    title: "Summary",
    icon: <FaAlignLeft />,
    classes: "border-sky-400/30 bg-sky-500/10 text-sky-100",
  },
};

function SectionCard({ type, value }) {
  const style = sectionStyles[type];
  if (!style || !value) return null;
  const items = Array.isArray(value) ? value : [];
  const text = typeof value === "string" ? value : "";

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className={`rounded-2xl border p-4 shadow-lg ${style.classes}`}
    >
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
        {style.icon}
        <span>{style.title}</span>
      </div>
      {items.length > 0 ? (
        <ul className="list-disc space-y-1 pl-5 text-sm">
          {items.map((item, idx) => (
            <li key={`${type}-${idx}`}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="text-sm">{text || "No major points detected."}</p>
      )}
    </motion.div>
  );
}

function ReviewCard({ review, structuredReview, score, mode = "developer", compareChanges = false }) {
  const toPoints = (text) =>
    String(text || "")
      .split(/\n|(?<=\.)\s+(?=[A-Z])|;\s+/)
      .map((line) => line.replace(/^\d+[\).\s-]*/, "").trim())
      .filter((line) => line.length > 6);

  const parsed =
    structuredReview && typeof structuredReview === "object"
      ? structuredReview
      : null;

  const isDiffReview =
    parsed &&
    (Object.prototype.hasOwnProperty.call(parsed, "changesSummary") ||
      Object.prototype.hasOwnProperty.call(parsed, "issuesInChanges"));

  const scoreValue = Number(score ?? 0);
  const scorePct = Math.max(0, Math.min(100, (scoreValue / 10) * 100));
  const scoreColor =
    scoreValue >= 8 ? "bg-emerald-500" : scoreValue >= 5 ? "bg-amber-500" : "bg-rose-500";

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 rounded-2xl border border-white/10 bg-slate-900/60 p-5 shadow-xl backdrop-blur"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full px-2 py-1 text-xs font-semibold ${
            mode === "beginner"
              ? "bg-emerald-500/20 text-emerald-200"
              : "bg-indigo-500/20 text-indigo-200"
          }`}
        >
          {mode === "beginner" ? "Beginner Friendly" : "Technical Review"}
        </span>
        {compareChanges && (
          <span className="rounded-full bg-sky-500/20 px-2 py-1 text-xs font-semibold text-sky-200">
            Diff-Based Review
          </span>
        )}
      </div>

      <div>
        <p className="mb-1 text-sm text-slate-400">Code Quality Score</p>
        <div className="mb-2 flex items-center gap-3">
          <span className="text-2xl font-bold text-white">{scoreValue.toFixed(1)} / 10</span>
          <span className="text-xs text-slate-400">AI-based confidence</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/10">
          <div className={`h-full ${scoreColor} transition-all duration-500`} style={{ width: `${scorePct}%` }} />
        </div>
      </div>

      {isDiffReview ? (
        <div className="space-y-3">
          <SectionCard type="summary" value={parsed.changesSummary || "No change summary provided."} />
          <SectionCard type="bugs" value={parsed.issuesInChanges || []} />
          <SectionCard type="improvements" value={parsed.improvements || []} />
        </div>
      ) : parsed ? (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <SectionCard type="bugs" value={parsed.bugs} />
          <SectionCard type="improvements" value={parsed.improvements} />
          <SectionCard type="goodPractices" value={parsed.goodPractices} />
          <SectionCard type="summary" value={parsed.summary} />
        </div>
      ) : (
        <div className="rounded-xl border border-white/10 bg-black/30 p-4 text-sm text-slate-200">
          <p className="mb-3 text-sm font-semibold text-slate-100">Review Points</p>
          <ul className="list-disc space-y-2 pl-5">
            {toPoints(review || "No review generated.").map((point, idx) => (
              <li key={`raw-point-${idx}`}>{point}</li>
            ))}
          </ul>
        </div>
      )}
    </motion.section>
  );
}

export default ReviewCard;
