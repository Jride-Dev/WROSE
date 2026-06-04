// test-native.mjs
// Validates native scoring math functions without Devvit runtime.
// Run: node scripts/test-native.mjs

function computeActivityVelocity(commentCount, postAgeHours) {
  return parseFloat((commentCount / Math.max(postAgeHours, 0.01)).toFixed(2));
}

function computeControversyIndicator(upvoteRatio) {
  return parseFloat((1 - Math.abs(upvoteRatio - 0.5) * 2).toFixed(4));
}

function computeEngagementRatio(commentCount, postScore) {
  return parseFloat((postScore > 0 ? commentCount / postScore : commentCount).toFixed(2));
}

function computeVolatilityScore(commentCount, postScore, upvoteRatio, postAgeHours) {
  const safeAge = Math.max(postAgeHours, 0.01);
  const factors = [];

  const velocity = commentCount / safeAge;
  const velocityFactor = Math.min(velocity / 10, 1);
  if (velocity > 5) factors.push("High comment velocity");
  else if (velocity > 1) factors.push("Moderate comment velocity");

  const controversyFactor = 1 - Math.abs(upvoteRatio - 0.5) * 2;
  if (controversyFactor > 0.6) factors.push("Controversial voting pattern");

  const er = postScore > 0 ? commentCount / postScore : commentCount;
  const engagementFactor = Math.min(er / 5, 1);
  if (er > 3) factors.push("High engagement relative to score");

  const score = parseFloat(
    (velocityFactor * 0.4 + controversyFactor * 0.35 + engagementFactor * 0.25).toFixed(4),
  );

  const explanation = factors.length > 0
    ? `Volatility=${score}. Factors: ${factors.join(", ")}. (v0.1 native Devvit)`
    : `Volatility=${score}. No significant volatility factors detected. (v0.1 native Devvit)`;

  return { score, factors, explanation };
}

function suggestModeratorView(commentCount, postScore, upvoteRatio, postAgeHours) {
  if (commentCount > 50 && postAgeHours < 2) return "Monitor — high activity in short window";
  if (upvoteRatio < 0.6 && postScore > 10) return "Review — controversial high-scoring thread may need moderator attention";
  if (commentCount > 100) return "Review — high comment volume";
  if (upvoteRatio > 0.9) return "No action needed — widely approved by community";
  if (postAgeHours > 24) return "Routine — thread is more than 24 hours old";
  return "Routine — no significant signals detected";
}

let passed = 0;
let failed = 0;

function assert(condition, name) {
  if (condition) {
    passed++;
    console.log(`  PASS: ${name}`);
  } else {
    failed++;
    console.error(`  FAIL: ${name}`);
  }
}

function assertClose(actual, expected, tolerance, name) {
  const ok = Math.abs(actual - expected) <= tolerance;
  if (ok) {
    passed++;
    console.log(`  PASS: ${name} (${actual})`);
  } else {
    failed++;
    console.error(`  FAIL: ${name} — expected ${expected} ±${tolerance}, got ${actual}`);
  }
}

console.log("=== Native Scoring Helper Tests ===\n");

// Activity velocity
assert(computeActivityVelocity(10, 1) === 10, "velocity: 10 comments in 1h = 10/hr");
assert(computeActivityVelocity(0, 1) === 0, "velocity: 0 comments = 0/hr");
assert(computeActivityVelocity(5, 0) > 0, "velocity: handles zero age (min 0.01h)");

// Controversy indicator
assert(computeControversyIndicator(0.5) === 1, "controversy: 0.5 ratio = 1.0 (most controversial)");
assert(computeControversyIndicator(0) === 0, "controversy: 0 ratio = 0 (unanimous)");
assert(computeControversyIndicator(1) === 0, "controversy: 1 ratio = 0 (unanimous)");
assertClose(computeControversyIndicator(0.75), 0.5, 0.01, "controversy: 0.75 ratio = 0.5");

// Engagement ratio
assert(computeEngagementRatio(10, 5) === 2, "engagement: 10 comments / 5 score = 2");
assert(computeEngagementRatio(0, 5) === 0, "engagement: 0 comments = 0");
assert(computeEngagementRatio(10, 0) === 10, "engagement: handles zero score");

// Volatility score
const v1 = computeVolatilityScore(100, 50, 0.5, 1);
assert(v1.score > 0, "volatility: high-activity controversial thread scores > 0");
assert(v1.factors.includes("High comment velocity"), "volatility: 100 comments in 1h = high velocity");
assert(v1.factors.includes("Controversial voting pattern"), "volatility: 0.5 ratio = controversial");
assert(v1.explanation.includes("(v0.1 native Devvit)"), "volatility: explanation marks v0.1 native");

const v2 = computeVolatilityScore(0, 5, 0.95, 48);
assert(v2.score < 0.3, "volatility: old quiet thread scores low");
assert(v2.factors.length === 0 || !v2.factors.includes("High comment velocity"), "volatility: 0 comments = no velocity factor");

// Moderator view suggestions
assert(suggestModeratorView(60, 100, 0.5, 1).startsWith("Monitor"), "mod view: 60 comments in 1h = Monitor");
assert(suggestModeratorView(10, 50, 0.55, 1).startsWith("Review"), "mod view: controversial high-score = Review");
assert(suggestModeratorView(150, 100, 0.8, 3).startsWith("Review"), "mod view: 150 comments = Review");
assert(suggestModeratorView(5, 10, 0.95, 1).startsWith("No action"), "mod view: high ratio = No action");
assert(suggestModeratorView(5, 10, 0.8, 48).startsWith("Routine"), "mod view: old thread = Routine");
assert(suggestModeratorView(5, 10, 0.8, 1).startsWith("Routine"), "mod view: no signals = Routine");

console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`);
process.exit(failed > 0 ? 1 : 0);
