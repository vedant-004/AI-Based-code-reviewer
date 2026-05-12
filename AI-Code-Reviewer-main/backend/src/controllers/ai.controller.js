const getAIResponse = require("../services/ai.service"); // ✅ FIXED
const promptService = require("../services/prompt.service");
const { getCodeQualityScore } = require("../utils/score.util");
const { parseStructuredReview } = require("../utils/reviewParser.util");

const enrichPromptPayload = (prompt) => {
  const reviewText = prompt.review || "";
  const structured =
    prompt.structuredReview && typeof prompt.structuredReview === "object"
      ? prompt.structuredReview
      : parseStructuredReview(reviewText) || reviewText;
  const computedScore =
    typeof prompt.score === "number" && !Number.isNaN(prompt.score)
      ? prompt.score
      : getCodeQualityScore({ code: prompt.code || "", aiResponse: reviewText });

  return {
    ...prompt,
    score: computedScore,
    structuredReview: structured,
  };
};

// CREATE REVIEW
module.exports.getReview = async (req, res) => {
  try {
    const { code, previousCode, mode, compareChanges } = req.body;

    if (!code || typeof code !== "string") {
      return res.status(400).json({ message: "Code is required and must be a string" });
    }
    if (previousCode !== undefined && typeof previousCode !== "string") {
      return res.status(400).json({ message: "previousCode must be a string when provided" });
    }
    if (mode !== undefined && !["beginner", "developer"].includes(mode)) {
      return res.status(400).json({ message: "mode must be beginner or developer" });
    }
    if (compareChanges !== undefined && typeof compareChanges !== "boolean") {
      return res.status(400).json({ message: "compareChanges must be a boolean when provided" });
    }

    const aiResult = await getAIResponse({
      code,
      previousCode,
      mode: mode || "developer",
      compareChanges: Boolean(compareChanges),
    });

    const prompt = await promptService.createPrompt({
      code,
      previousCode,
      rawReview: aiResult.rawReview,
      score: aiResult.score,
      structuredReview: aiResult.structuredReview,
    });

    const payload = enrichPromptPayload({
      ...prompt,
      review: aiResult.rawReview,
      score: aiResult.score,
      structuredReview: aiResult.structuredReview,
    });
    res.json({
      ...payload,
      oldCode: prompt.previousCode,
      newCode: prompt.code,
      mode: aiResult.mode,
      compareChanges: aiResult.compareChanges,
    });
  } catch (error) {
    console.error("Error in getReview:", error);
    res.status(500).json({ message: "Failed to generate review", error: error.message });
  }
};

// GET HISTORY
module.exports.getPastPrompts = async (req, res) => {
  try {
    const prompts = await promptService.getPrompts();
    const transformed = prompts.map((prompt) => ({
      ...enrichPromptPayload(prompt),
      oldCode: prompt.previousCode,
      newCode: prompt.code,
    }));
    res.json(transformed);
  } catch (error) {
    console.error("Error fetching prompts:", error);
    res.status(500).json({ message: "Failed to fetch prompts", error: error.message });
  }
};

// UPDATE REVIEW
module.exports.updateReview = async (req, res) => {
  const { id } = req.params;
  const { code, previousCode, mode, compareChanges } = req.body;

  try {
    if (!id) return res.status(400).json({ message: "Invalid ID" });
    if (!code || typeof code !== "string") {
      return res.status(400).json({ message: "Code is required and must be a string" });
    }
    if (previousCode !== undefined && typeof previousCode !== "string") {
      return res.status(400).json({ message: "previousCode must be a string when provided" });
    }
    if (mode !== undefined && !["beginner", "developer"].includes(mode)) {
      return res.status(400).json({ message: "mode must be beginner or developer" });
    }
    if (compareChanges !== undefined && typeof compareChanges !== "boolean") {
      return res.status(400).json({ message: "compareChanges must be a boolean when provided" });
    }

    const aiResult = await getAIResponse({
      code,
      previousCode,
      mode: mode || "developer",
      compareChanges: Boolean(compareChanges),
    });

    const updatedPrompt = await promptService.updatePrompt({
      id,
      code,
      previousCode,
      rawReview: aiResult.rawReview,
      score: aiResult.score,
      structuredReview: aiResult.structuredReview,
    });

    const payload = enrichPromptPayload({
      ...updatedPrompt,
      review: aiResult.rawReview,
      score: aiResult.score,
      structuredReview: aiResult.structuredReview,
    });
    res.json({
      ...payload,
      oldCode: updatedPrompt.previousCode,
      newCode: updatedPrompt.code,
      mode: aiResult.mode,
      compareChanges: aiResult.compareChanges,
    });
  } catch (error) {
    console.error("Error updating review:", error);
    res.status(500).json({ message: "Failed to update review", error: error.message });
  }
};

// DELETE REVIEW
module.exports.deleteReview = async (req, res) => {
  const { id } = req.params;

  try {
    if (!id) return res.status(400).json({ message: "Invalid ID" });

    await promptService.deletePrompt(id);

    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({ message: "Failed to delete review", error: error.message });
  }
};

// GET ANALYTICS
module.exports.getAnalytics = async (req, res) => {
  try {
    const analytics = await promptService.getAnalytics();

    res.json({
      totalReviews: analytics.totalReviews,
      averageScore: analytics.averageScore,
      latestReviews: analytics.latestReviews.map((review) => ({
        ...enrichPromptPayload(review),
        oldCode: review.previousCode,
        newCode: review.code,
      })),
    });
  } catch (error) {
    console.error("Error getting analytics:", error);
    res.status(500).json({ message: "Failed to fetch analytics", error: error.message });
  }
};