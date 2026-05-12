const extractSectionItems = (text, sectionName) => {
  const regex = new RegExp(`(?:^|\\n)#{0,3}\\s*${sectionName}\\s*\\n([\\s\\S]*?)(?=\\n#{1,3}\\s*|$)`, "i");
  const match = text.match(regex);
  if (!match?.[1]) return [];

  return match[1]
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("-") || line.startsWith("*") || /^\d+\./.test(line))
    .map((line) => line.replace(/^[-*]\s*/, "").replace(/^\d+\.\s*/, "").trim())
    .filter(Boolean);
};

const extractSummary = (text) => {
  const summaryRegex = /(?:^|\n)#{0,3}\s*summary\s*\n([\s\S]*?)(?=\n#{1,3}\s*|$)/i;
  const match = text.match(summaryRegex);
  if (match?.[1]) {
    return match[1].trim();
  }
  return text.split("\n").slice(0, 3).join(" ").trim();
};

const splitIntoPoints = (text) => {
  return text
    .replace(/\r/g, "")
    .split(/\n|(?<=\.)\s+(?=[A-Z])|;\s+/)
    .map((part) => part.replace(/^[-*]\s*/, "").replace(/^\d+[\).\s-]*/, "").trim())
    .filter((part) => part.length > 8);
};

const unique = (items) => Array.from(new Set(items.map((item) => item.trim()).filter(Boolean)));

const extractNumberedSections = (text) => {
  const sections = {
    bugs: [],
    improvements: [],
    goodPractices: [],
    summary: "",
  };

  const patterns = [
    { key: "bugs", regex: /(?:^|\n)\s*(?:\d+[\).\s-]*)?(?:bugs?|issues?|security issues?)\s*[:\-]?\s*([\s\S]*?)(?=(?:\n\s*\d+[\).\s-]*\s*(?:improvements?|good practices?|summary)|$))/i },
    { key: "improvements", regex: /(?:^|\n)\s*(?:\d+[\).\s-]*)?(?:improvements?|performance improvements?|readability suggestions?)\s*[:\-]?\s*([\s\S]*?)(?=(?:\n\s*\d+[\).\s-]*\s*(?:good practices?|summary|bugs?)|$))/i },
    { key: "goodPractices", regex: /(?:^|\n)\s*(?:\d+[\).\s-]*)?(?:good practices?|strengths?)\s*[:\-]?\s*([\s\S]*?)(?=(?:\n\s*\d+[\).\s-]*\s*(?:summary|bugs?|improvements?)|$))/i },
    { key: "summary", regex: /(?:^|\n)\s*(?:\d+[\).\s-]*)?summary\s*[:\-]?\s*([\s\S]*?)$/i },
  ];

  patterns.forEach(({ key, regex }) => {
    const match = text.match(regex);
    if (!match?.[1]) return;
    if (key === "summary") {
      sections.summary = match[1].trim();
    } else {
      sections[key] = splitIntoPoints(match[1]);
    }
  });

  return sections;
};

const parseStructuredReview = (rawText) => {
  try {
    const maybeJson = JSON.parse(rawText);
    if (maybeJson && typeof maybeJson === "object") {
      return {
        bugs: Array.isArray(maybeJson.bugs) ? maybeJson.bugs : [],
        improvements: Array.isArray(maybeJson.improvements) ? maybeJson.improvements : [],
        goodPractices: Array.isArray(maybeJson.goodPractices) ? maybeJson.goodPractices : [],
        summary: typeof maybeJson.summary === "string" ? maybeJson.summary : "",
      };
    }
  } catch (_) {
    // Fallback to text parsing below.
  }

  const numbered = extractNumberedSections(rawText);
  const bugs = unique([
    ...numbered.bugs,
    ...extractSectionItems(rawText, "bugs?"),
  ]);
  const improvements = unique([
    ...numbered.improvements,
    ...extractSectionItems(rawText, "improvements?|performance improvements|readability suggestions"),
  ]);
  const goodPractices = unique([
    ...numbered.goodPractices,
    ...extractSectionItems(rawText, "good practices?|strengths?"),
  ]);
  const summary = numbered.summary || extractSummary(rawText);

  if (!bugs.length && !improvements.length && !goodPractices.length) {
    const points = splitIntoPoints(rawText);
    points.forEach((point) => {
      if (/(bug|issue|error|vulnerab|risk)/i.test(point)) bugs.push(point);
      else if (/(good|best practice|clean|well|solid|nice)/i.test(point)) goodPractices.push(point);
      else improvements.push(point);
    });
  }

  const hasStructuredData = bugs.length || improvements.length || goodPractices.length || summary;
  if (!hasStructuredData) {
    return null;
  }

  return { bugs, improvements, goodPractices, summary };
};

module.exports = { parseStructuredReview };
