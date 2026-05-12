// No external API calls

function analyzeCode(code) {
  const issues = [];
  const suggestions = [];
  let score = 10;

  // --- Bug Detection ---
  if (code.includes("==") && !code.includes("===")) {
    issues.push({
      type: "Bug",
      message: "Use strict equality (==)= instead of loose equality (==)"
    });
    score -= 1;
  }

 const { getAIResponse } = require("../services/localAI.service");

module.exports.getReview = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).send("Code is required");
    }

    const review = await getAIResponse(code);

    res.json(review);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error generating review");
  }
};
  if (code.includes("var ")) {
    issues.push({
      type: "Readability",
      message: "Avoid using 'var'. Use 'let' or 'const' instead."
    });
    score -= 0.5;
  }

  if (code.includes("console.log")) {
    issues.push({
      type: "Best Practice",
      message: "Remove console.log statements in production code"
    });
    score -= 0.5;
  }

  // --- Security Checks ---
  if (code.includes("password") && code.includes("=")) {
    issues.push({
      type: "Security",
      message: "Avoid storing passwords in plain text"
    });
    score -= 2;
  }

  if (code.includes("SELECT *") || code.includes("${")) {
    issues.push({
      type: "Security",
      message: "Possible SQL Injection risk. Use parameterized queries."
    });
    score -= 2;
  }

  // --- Performance ---
  if (code.includes("for") && code.includes("await")) {
    issues.push({
      type: "Performance",
      message: "Avoid using await inside loops. Use Promise.all instead."
    });
    score -= 1;
  }

  // --- Suggestions ---
  suggestions.push("Use consistent naming conventions");
  suggestions.push("Add error handling (try/catch)");
  suggestions.push("Write unit tests for critical functions");

  // --- Final structured response ---
  return {
    score: Math.max(score, 1),
    summary: generateSummary(issues),
    issues,
    suggestions
  };
}

// Generate human-like summary
function generateSummary(issues) {
  if (issues.length === 0) {
    return "Code looks clean with no major issues.";
  }

  const bugCount = issues.filter(i => i.type === "Bug").length;
  const securityCount = issues.filter(i => i.type === "Security").length;

  return `Detected ${issues.length} issues (${bugCount} bugs, ${securityCount} security risks). Improvements recommended.`;
}

// Simulated async "AI" function
async function getAIResponse(code) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const result = analyzeCode(code);
      resolve(result);
    }, 500); // simulate thinking time
  });
}

module.exports = { getAIResponse };































# 1. Logical Bug (Wrong Condition)
# function checkAge(age) {
#   if (age = 18) {
#     return "Adult";
#   }
#   return "Minor";
# }
# ✅ Expected Output:
# ❌ Assignment (=) instead of comparison (===)
# Suggest fix:
# if (age === 18)
# Score ↓
# 🔴 2. Infinite Loop
# while (true) {
#   console.log("Running...");
# }
# ✅ Expected:
# ❌ Infinite loop detected
# ⚠️ High CPU usage warning
# Suggest exit condition
# 🔴 3. Undefined Variable
# function greet() {
#   console.log(name);
# }
# ✅ Expected:
# ❌ name is not defined
# Suggest passing parameter
# 🔴 4. SQL Injection Risk
# const query = `SELECT * FROM users WHERE email = '${email}'`;
# ✅ Expected:
# 🔴 Security issue: SQL Injection
# Suggest parameterized query / ORM
# 🔴 5. Hardcoded Password
# const password = "123456";
# ✅ Expected:
# 🔴 Security issue: hardcoded credentials
# Suggest env variables
# 🔴 6. Async Mistake (Missing await)
# async function getData() {
#   const data = fetch("https://api.com/data");
#   console.log(data);
# }
# ✅ Expected:
# ❌ Missing await
# Suggest:
# const data = await fetch(...)
# 🔴 7. Await in Loop (Performance Issue)
# for (let i = 0; i < 5; i++) {
#   await fetch("https://api.com/data");
# }
# ✅ Expected:
# ⚠️ Performance issue
# Suggest Promise.all
# 🔴 8. Callback Hell (Bad Structure)
# fs.readFile("file.txt", (err, data) => {
#   fs.writeFile("copy.txt", data, (err) => {
#     fs.appendFile("log.txt", "done", () => {});
#   });
# });
# ✅ Expected:
# ⚠️ Poor readability
# Suggest async/await
# 🔴 9. Memory Leak Risk
# setInterval(() => {
#   console.log("Running...");
# }, 1000);
# ✅ Expected:
# ⚠️ Potential memory leak
# Suggest clearing interval
# 🔴 10. Bad Naming / Readability
# function x(a,b){return a+b;}
# ✅ Expected:
# ⚠️ Poor naming
# Suggest descriptive names
# 🔴 11. Unused Variable
# let count = 10;
# function test() {
#   return 5;
# }
# ✅ Expected:
# ⚠️ Unused variable
# Suggest cleanup
# 🔴 12. Missing Error Handling
# async function fetchData() {
#   const res = await fetch("https://api.com");
#   return res.json();
# }
# ✅ Expected:
# ⚠️ Missing try/catch
# Suggest error handling


class Solution {
public:
    void rotate(vector<vector<int>>& matrix) {
        int row = matrix.size();
        for(int i=0;i<row; i++){
            for(int j=0; j<i;j++){
                swap(matrix[i][j], matrix[j][i]);
            }
        }
        for(int i=0;i<row;i++){
            reverse(matrix[i].begin(), matrix[i].end());
        }
    }
};