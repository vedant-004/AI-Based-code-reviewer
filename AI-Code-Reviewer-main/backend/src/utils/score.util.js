const KEYWORDS = ["optimize", "improve", "bug", "security", "performance", "readability", "refactor"];

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const getCodeQualityScore = ({ code = "", aiResponse = "" }) => {
  const codeLength = code.length;

  let lengthScore = 2;
  if (codeLength > 100 && codeLength <= 800) lengthScore = 4;
  else if (codeLength > 800 && codeLength <= 3000) lengthScore = 3.5;
  else if (codeLength > 3000) lengthScore = 3;

  const lowerCode = code.toLowerCase();
  const lowerResponse = aiResponse.toLowerCase();

  const keywordHits = KEYWORDS.reduce((count, word) => {
    const inCode = lowerCode.includes(word);
    const inResponse = lowerResponse.includes(word);
    return count + (inCode || inResponse ? 1 : 0);
  }, 0);

  const keywordScore = Math.min(3, keywordHits * 0.5);

  let responseScore = 1;
  if (aiResponse.length > 80) responseScore += 0.7;
  if (/(bug|issue|vulnerab|error)/i.test(aiResponse)) responseScore += 0.5;
  if (/(improve|optimi|refactor|clean|readability|performance)/i.test(aiResponse)) responseScore += 0.8;
  if (/(summary|overall|conclusion)/i.test(aiResponse)) responseScore += 0.5;

  const rawScore = lengthScore + keywordScore + responseScore;
  return Number(clamp(rawScore, 1, 10).toFixed(1));
};

module.exports = { getCodeQualityScore };
