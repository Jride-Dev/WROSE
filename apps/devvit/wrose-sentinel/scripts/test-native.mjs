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

// === Comment-aware helpers ===

const HOSTILE_TERMS = [
  "bullshit", "garbage", "trash", "idiot", "moron",
  "stupid", "waste", "fuck", "fucking",
];

function containsHostileTerm(body) {
  const lower = body.toLowerCase();
  return HOSTILE_TERMS.some((term) => lower.includes(term));
}

function hasSymbolBurst(body) {
  return /[^a-zA-Z0-9\s]{8,}/.test(body);
}

function extractCommentSignals(comments, postAuthorName, now) {
  const participants = new Set();
  let opCount = 0;
  let recent15 = 0;
  let recent60 = 0;
  let hostile = 0;
  let symbolBursts = 0;
  let latest = null;

  for (const c of comments) {
    const author = c.authorName ?? "";
    participants.add(author);
    if (author === postAuthorName) opCount++;

    const createdAt = c.createdAt instanceof Date ? c.createdAt : new Date(c.createdAt ?? now);
    if (latest === null || createdAt > latest) latest = createdAt;

    const ageHours = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
    const ageMinutes = ageHours * 60;

    if (ageMinutes <= 15) recent15++;
    if (ageMinutes <= 60) recent60++;

    const body = c.body ?? "";
    if (containsHostileTerm(body)) hostile++;
    if (hasSymbolBurst(body)) symbolBursts++;
  }

  const analyzed = comments.length;
  const uniqueParticipants = participants.size;
  const stale = latest === null || (now.getTime() - latest.getTime()) > 72 * 60 * 60 * 1000;

  let confidence;
  if (analyzed >= 10 && uniqueParticipants >= 3) {
    confidence = "high";
  } else if (analyzed >= 5 && uniqueParticipants >= 2) {
    confidence = "medium";
  } else {
    confidence = "low";
  }

  return {
    commentsAnalyzed: analyzed,
    uniqueParticipants,
    opCommentCount: opCount,
    recentComments15m: recent15,
    recentComments60m: recent60,
    hostileCommentCount: hostile,
    symbolBurstCount: symbolBursts,
    latestCommentAt: latest,
    stale,
    confidence,
  };
}

function suggestCommentAwareModView(signals) {
  const { uniqueParticipants, recentComments60m, hostileCommentCount, symbolBurstCount, stale, confidence } = signals;

  if (uniqueParticipants < 2) {
    if (
      recentComments60m >= 5 ||
      (hostileCommentCount >= 1 && recentComments60m >= 3) ||
      (symbolBurstCount >= 1 && recentComments60m >= 3)
    ) {
      return `Monitor — single-participant activity (confidence: ${confidence})`;
    }
    if (stale) return "Routine — stale thread with no meaningful recent activity";
    return "Routine — no significant signals detected";
  }

  if (uniqueParticipants >= 3 && (recentComments60m >= 15 || hostileCommentCount >= 3)) {
    return "Review — significant multi-participant activity";
  }

  if (recentComments60m >= 5) {
    return `Monitor — recent activity (confidence: ${confidence})`;
  }
  if (hostileCommentCount >= 1 && recentComments60m >= 3) {
    return `Monitor — hostile comments detected (confidence: ${confidence})`;
  }
  if (symbolBurstCount >= 1 && recentComments60m >= 3) {
    return `Monitor — unusual comment patterns (confidence: ${confidence})`;
  }

  if (stale) return "Routine — stale thread with no meaningful recent activity";
  return "Routine — no significant signals detected";
}

console.log("\n=== Comment Signal Extraction Tests ===\n");

// Helper: create a comment input
function makeComment(authorName, body, ageHours, score) {
  const createdAt = new Date(Date.now() - ageHours * 60 * 60 * 1000);
  return { authorName, body, createdAt, score: score ?? 1 };
}

const now = new Date();

// 1. Stale thread: 2 comments, 1 participant, 16 days old → Routine, low confidence
const staleComments = [
  makeComment("user1", "old comment", 16 * 24, 1),
  makeComment("user1", "another old comment", 16 * 24 - 1, 2),
];
const staleSignals = extractCommentSignals(staleComments, "author", now);
assert(staleSignals.stale === true, "stale: 16-day-old comments are stale");
assert(staleSignals.commentsAnalyzed === 2, "stale: analyzed 2 comments");
assert(staleSignals.uniqueParticipants === 1, "stale: 1 participant");
assert(staleSignals.confidence === "low", "stale: low confidence");
const staleView = suggestCommentAwareModView(staleSignals);
assert(staleView.startsWith("Routine"), "stale: mod view is Routine");

// 2. Fresh thread: 4 comments, 1 participant, one symbol burst → Monitor, low confidence
const burstComments = [
  makeComment("user1", "normal comment", 0.5, 1),
  makeComment("user1", "normal reply", 0.4, 2),
  makeComment("user1", "!!!@#$%^&*!!!! test", 0.3, 1),
  makeComment("user1", "another normal", 0.2, 3),
];
const burstSignals = extractCommentSignals(burstComments, "author", now);
assert(burstSignals.stale === false, "burst: not stale");
assert(burstSignals.commentsAnalyzed === 4, "burst: analyzed 4 comments");
assert(burstSignals.uniqueParticipants === 1, "burst: 1 participant");
assert(burstSignals.symbolBurstCount >= 1, "burst: symbol burst detected");
assert(burstSignals.confidence === "low", "burst: low confidence");
const burstView = suggestCommentAwareModView(burstSignals);
assert(burstView.startsWith("Monitor"), "burst: mod view is Monitor");

// 3. Fresh thread: 6 comments, 3 participants, hostile terms → Monitor or Review
const hostileComments = [
  makeComment("user1", "this is bullshit", 0.5, -2),
  makeComment("user2", "I agree, garbage post", 0.4, -1),
  makeComment("user3", "normal comment here", 0.3, 5),
  makeComment("user1", "you are an idiot", 0.2, -3),
  makeComment("user2", "what a waste of time", 0.1, 0),
  makeComment("user3", "another normal reply", 0.05, 2),
];
const hostileSignals = extractCommentSignals(hostileComments, "author", now);
assert(hostileSignals.stale === false, "hostile: not stale");
assert(hostileSignals.commentsAnalyzed === 6, "hostile: analyzed 6 comments");
assert(hostileSignals.uniqueParticipants === 3, "hostile: 3 participants");
assert(hostileSignals.hostileCommentCount >= 1, "hostile: hostile terms detected");
assert(hostileSignals.confidence === "medium", "hostile: medium confidence");
const hostileView = suggestCommentAwareModView(hostileSignals);
assert(hostileView.startsWith("Monitor") || hostileView.startsWith("Review"), "hostile: mod view is Monitor or Review");

// 4. Fresh thread: 15 comments, 3 participants, at least 3 hostile → Review
const reviewComments = [];
for (let i = 0; i < 12; i++) {
  reviewComments.push(makeComment(`user${(i % 3) + 1}`, "normal comment", 0.5, 1));
}
reviewComments.push(makeComment("user1", "this is bullshit", 0.4, -2));
reviewComments.push(makeComment("user2", "you are a moron", 0.3, -1));
reviewComments.push(makeComment("user3", "what a trash post", 0.2, -3));
const reviewSignals = extractCommentSignals(reviewComments, "author", now);
assert(reviewSignals.stale === false, "review: not stale");
assert(reviewSignals.commentsAnalyzed === 15, "review: analyzed 15 comments");
assert(reviewSignals.uniqueParticipants === 3, "review: 3 participants");
assert(reviewSignals.hostileCommentCount >= 3, "review: at least 3 hostile comments");
assert(reviewSignals.confidence === "high", "review: high confidence");
const reviewView = suggestCommentAwareModView(reviewSignals);
assert(reviewView.startsWith("Review"), "review: mod view is Review");

// 5. Single participant with 20 comments → never Review
const singleComments = [];
for (let i = 0; i < 20; i++) {
  singleComments.push(makeComment("user1", `comment ${i}`, 0.5, 1));
}
const singleSignals = extractCommentSignals(singleComments, "author", now);
assert(singleSignals.uniqueParticipants === 1, "single: 1 participant");
assert(singleSignals.commentsAnalyzed === 20, "single: 20 comments");
const singleView = suggestCommentAwareModView(singleSignals);
assert(!singleView.startsWith("Review"), "single: never Review with 1 participant");

// 6. Hostility matching is case-insensitive
assert(containsHostileTerm("This is BULLSHIT"), "hostile: case insensitive BULLSHIT");
assert(containsHostileTerm("you are a StUpId person"), "hostile: case insensitive StUpId");
assert(containsHostileTerm("FUCKING garbage"), "hostile: case insensitive FUCKING");

// 7. Normal comments do not trigger hostility
assert(!containsHostileTerm("This is a normal comment"), "hostile: normal comment not flagged");
assert(!containsHostileTerm("Hello, how are you today?"), "hostile: greeting not flagged");

// 8. Stale detection uses recent comment timestamps
const oldComments = [
  makeComment("user1", "old", 100, 1),
  makeComment("user2", "also old", 90, 1),
];
const oldSignals = extractCommentSignals(oldComments, "author", now);
assert(oldSignals.stale === true, "stale: 100-hour-old comments are stale");

const freshComments = [
  makeComment("user1", "recent", 24, 1),
  makeComment("user2", "also recent", 23, 1),
];
const freshSignals = extractCommentSignals(freshComments, "author", now);
assert(freshSignals.stale === false, "stale: 24-hour-old comments are not stale");

console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`);
process.exit(failed > 0 ? 1 : 0);
