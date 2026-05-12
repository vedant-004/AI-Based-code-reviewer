// utils/evaluation.js

function calculateAccuracy(reviewText) {
  let score = 0;

  const keywords = [
    "bug",
    "error",
    "undefined",
    "incorrect",
    "issue",
    "security",
    "vulnerability"
  ];

  keywords.forEach(word => {
    if (reviewText.toLowerCase().includes(word)) {
      score += 1;
    }
  });

  return Math.min((score / keywords.length) * 10, 10);
}

// ------------------------------

function calculateCompleteness(reviewText) {
  let categoriesCovered = 0;

  const categories = {
    bugs: ["bug", "error", "issue"],
    security: ["security", "vulnerability", "injection"],
    performance: ["performance", "optimize", "slow"],
    readability: ["readability", "clean code", "naming"],
  };

  for (let key in categories) {
    if (categories[key].some(word => reviewText.toLowerCase().includes(word))) {
      categoriesCovered++;
    }
  }

  return (categoriesCovered / Object.keys(categories).length) * 10;
}

// ------------------------------

function calculateActionability(reviewText) {
  let score = 0;

  const actionWords = [
    "use",
    "replace",
    "add",
    "remove",
    "avoid",
    "consider",
    "refactor",
    "should"
  ];

  actionWords.forEach(word => {
    if (reviewText.toLowerCase().includes(word)) {
      score += 1;
    }
  });

  return Math.min((score / actionWords.length) * 10, 10);
}

// ------------------------------

function evaluateReview(reviewText) {
  const accuracy = calculateAccuracy(reviewText);
  const completeness = calculateCompleteness(reviewText);
  const actionability = calculateActionability(reviewText);

  const overallScore = (
    accuracy * 0.4 +
    completeness * 0.3 +
    actionability * 0.3
  ).toFixed(2);

  return {
    accuracy: accuracy.toFixed(2),
    completeness: completeness.toFixed(2),
    actionability: actionability.toFixed(2),
    overallScore
  };
}

module.exports = {
  evaluateReview
};