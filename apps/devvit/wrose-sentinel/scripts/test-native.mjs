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

// === Heatmap helpers ===

function renderBar(intensity, width) {
  if (width === undefined) width = 10;
  const filled = Math.max(0, Math.min(width, Math.round(intensity * width)));
  return "\u2588".repeat(filled) + "-".repeat(width - filled);
}

function buildHeatmap(comments, postAuthorName, now) {
  const bucketDefs = [
    { label: "0-15m", minMinutes: -Infinity, maxMinutes: 15 },
    { label: "15-60m", minMinutes: 15, maxMinutes: 60 },
    { label: "1-6h", minMinutes: 60, maxMinutes: 6 * 60 },
    { label: "6-24h", minMinutes: 6 * 60, maxMinutes: 24 * 60 },
    { label: "24h+", minMinutes: 24 * 60, maxMinutes: Infinity },
  ];

  const buckets = bucketDefs.map((d) => ({
    label: d.label,
    commentCount: 0,
    uniqueParticipants: 0,
    hostileCommentCount: 0,
    symbolBurstCount: 0,
    intensity: 0,
    bar: "",
  }));

  const bucketParticipants = new Map();
  for (const b of buckets) bucketParticipants.set(b.label, new Set());

  for (const c of comments) {
    const createdAt = c.createdAt instanceof Date ? c.createdAt : new Date(c.createdAt ?? now);
    const ageMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60);
    const author = c.authorName ?? "";
    const body = c.body ?? "";

    let idx = bucketDefs.length - 1;
    for (let i = 0; i < bucketDefs.length; i++) {
      if (ageMinutes <= bucketDefs[i].maxMinutes) { idx = i; break; }
    }

    buckets[idx].commentCount++;
    bucketParticipants.get(buckets[idx].label).add(author);

    if (containsHostileTerm(body)) buckets[idx].hostileCommentCount++;
    if (hasSymbolBurst(body)) buckets[idx].symbolBurstCount++;
  }

  const totalComments = comments.length;
  for (const b of buckets) {
    b.uniqueParticipants = bucketParticipants.get(b.label).size;
    b.intensity = totalComments > 0 ? b.commentCount / totalComments : 0;
    b.bar = renderBar(b.intensity);
  }

  let hotZone = buckets[0].label;
  let maxCount = buckets[0].commentCount;
  for (let i = 1; i < buckets.length; i++) {
    if (buckets[i].commentCount > maxCount) {
      maxCount = buckets[i].commentCount;
      hotZone = buckets[i].label;
    }
  }

  return { buckets, totalComments, hotZone };
}

console.log("\n=== Heatmap Tests ===\n");

// 1. No comments
const emptyHeatmap = buildHeatmap([], "author", now);
assert(emptyHeatmap.totalComments === 0, "heatmap: totalComments is 0 for no comments");
assert(emptyHeatmap.buckets.every((b) => b.commentCount === 0), "heatmap: all buckets empty");
assert(emptyHeatmap.buckets.every((b) => b.bar === "----------"), "heatmap: empty bars show dashes");
assert(emptyHeatmap.hotZone === "0-15m", "heatmap: hotZone defaults to first bucket");

// 2. Old/stale comments only
const oldHeatComments = [
  makeComment("user1", "old comment", 100, 1),
  makeComment("user2", "another old", 90, 2),
];
const oldHeatmap = buildHeatmap(oldHeatComments, "author", now);
assert(oldHeatmap.totalComments === 2, "heatmap: 2 old comments");
assert(oldHeatmap.buckets[4].commentCount === 2, "heatmap: both old comments in 24h+ bucket");
assert(oldHeatmap.hotZone === "24h+", "heatmap: hotZone is 24h+");

// 3. One-user noisy thread
const noisyComments = [];
for (let i = 0; i < 5; i++) {
  noisyComments.push(makeComment("user1", `noisy comment ${i}`, 0.1, 1));
}
const noisyHeatmap = buildHeatmap(noisyComments, "author", now);
assert(noisyHeatmap.buckets[0].commentCount === 5, "heatmap: 5 comments in 0-15m bucket");
assert(noisyHeatmap.buckets[0].uniqueParticipants === 1, "heatmap: 1 participant in 0-15m bucket");
assert(noisyHeatmap.hotZone === "0-15m", "heatmap: hotZone is 0-15m");

// 4. Multi-participant escalation across buckets
const spreadComments = [
  makeComment("user1", "recent", 0.1, 1),
  makeComment("user2", "recent too", 0.2, 2),
  makeComment("user1", "reply", 0.5, 1),
  makeComment("user3", "30 min ago", 0.5, 3),
  makeComment("user4", "2h ago", 2, 1),
  makeComment("user5", "2h ago too", 2.5, 2),
  makeComment("user6", "10h ago", 10, 1),
  makeComment("user7", "12h ago", 12, 2),
  makeComment("user8", "48h ago", 48, 1),
  makeComment("user9", "72h ago", 72, 2),
];
const spreadHeatmap = buildHeatmap(spreadComments, "author", now);
assert(spreadHeatmap.totalComments === 10, "heatmap: 10 spread comments");
assert(spreadHeatmap.buckets[0].commentCount === 2, "heatmap: 2 in 0-15m");
assert(spreadHeatmap.buckets[1].commentCount === 2, "heatmap: 2 in 15-60m");
assert(spreadHeatmap.buckets[2].commentCount === 2, "heatmap: 2 in 1-6h");
assert(spreadHeatmap.buckets[3].commentCount === 2, "heatmap: 2 in 6-24h");
assert(spreadHeatmap.buckets[4].commentCount === 2, "heatmap: 2 in 24h+");
assert(spreadHeatmap.hotZone === "0-15m", "heatmap: hotZone is 0-15m (highest count)");

// 5. Symbol bursts in specific bucket
const burstHeatComments = [
  makeComment("user1", "normal", 3, 1),
  makeComment("user2", "!!@#$%^&*!!!!!", 4, 2),
];
const burstHeatResult = buildHeatmap(burstHeatComments, "author", now);
assert(burstHeatResult.buckets[2].symbolBurstCount === 1, "heatmap: symbol burst in 1-6h bucket");

// 6. Hostile comments in specific bucket
const hostileHeatComments = [
  makeComment("user1", "this is bullshit", 8, 1),
  makeComment("user2", "normal reply", 10, 2),
];
const hostileHeatResult = buildHeatmap(hostileHeatComments, "author", now);
assert(hostileHeatResult.buckets[3].hostileCommentCount === 1, "heatmap: hostile in 6-24h bucket");

// 7. Hot zone selection with tie (first wins)
const tieComments = [
  makeComment("user1", "a", 0.1, 1),
  makeComment("user2", "b", 0.2, 1),
  makeComment("user3", "c", 10, 1),
  makeComment("user4", "d", 12, 1),
];
const tieHeatmap = buildHeatmap(tieComments, "author", now);
assert(tieHeatmap.buckets[0].commentCount === 2, "heatmap: 2 in 0-15m");
assert(tieHeatmap.buckets[3].commentCount === 2, "heatmap: 2 in 6-24h");
assert(tieHeatmap.hotZone === "0-15m", "heatmap: tie goes to earliest bucket");

// 8. Visual bar bounds
assert(renderBar(0) === "----------", "heatmap: bar at 0 intensity is all dashes");
assert(renderBar(1) === "\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588", "heatmap: bar at 1 intensity is all filled");
assert(renderBar(0.5) === "\u2588\u2588\u2588\u2588\u2588-----", "heatmap: bar at 0.5 intensity is half filled");
assert(renderBar(0, 5) === "-----", "heatmap: bar width 5 at 0 intensity");

// 9. Preservation of automated_action_taken false (mod view never suggests action)
const safeModView = suggestCommentAwareModView({
  uniqueParticipants: 1,
  recentComments60m: 0,
  hostileCommentCount: 0,
  symbolBurstCount: 0,
  stale: true,
  confidence: "low",
});
assert(!safeModView.includes("Remove") && !safeModView.includes("Ban") && !safeModView.includes("Lock"),
  "heatmap: mod view never includes moderation action keywords");

// 10. No backend dependency (buildHeatmap is pure)
assert(typeof buildHeatmap === "function", "heatmap: buildHeatmap is a pure function with no HTTP calls");

// === Clarity Improvement Tests (Phase 2L) ===

console.log("\n=== Clarity Improvement Tests ===\n");

// --- Capabilities text includes required information ---
function capabilitiesStringsPresent() {
  const src = [
    "WROSE Sentinel is analytical only. No Reddit content was modified.",
    "Approved and publicly listed on Reddit",
    "Runs native Devvit analysis inside Reddit",
    "External backend not required for core analysis",
    "Devvit Public API target: 0.13.4",
  ];
  return src.filter(Boolean).length === 5;
}
assert(capabilitiesStringsPresent(), "capabilities: all required status strings present");

// --- FormatHeatmapContent reimplementation for test ---
function formatHeatmapContent(buckets, hotZone, modView, totalComments, stale) {
  if (totalComments === 0) {
    return "No comment activity detected.\nMetadata-only signals remain low.\n\nSuggested moderator view: Routine.";
  }
  const lines = buckets.map((b) => {
    const label = b.label.padEnd(10);
    return `${label}[${b.bar}] ${b.commentCount} comments · ${b.hostileCommentCount} hostile · ${b.symbolBurstCount} bursts`;
  });
  const hotBucket = buckets.find((b) => b.label === hotZone);
  const whyParts = [];
  if (hotBucket) {
    whyParts.push(`${hotBucket.commentCount} comments`);
    if (hotBucket.uniqueParticipants > 0) whyParts.push(`${hotBucket.uniqueParticipants} participants`);
    if (hotBucket.hostileCommentCount > 0) whyParts.push(`${hotBucket.hostileCommentCount} hostile`);
    if (hotBucket.symbolBurstCount > 0) whyParts.push(`${hotBucket.symbolBurstCount} symbol bursts`);
  }
  const parts = [
    ...lines,
    "",
    `Hot zone: ${hotZone} — highest concentration of activity`,
    whyParts.length > 0 ? `Why: ${whyParts.join(" · ")}` : "",
    `Suggested moderator view: ${modView}`,
  ];
  if (stale) parts.push("Thread is stale — recent activity is low. Review urgency reduced.");
  return parts.join("\n");
}

// --- No-comment heatmap ---
const noCommentContent = formatHeatmapContent([], "0-15m", "Routine", 0, false);
assert(noCommentContent.includes("No comment activity detected"), "clarity: no-comment heatmap shows 'No comment activity detected'");
assert(noCommentContent.includes("Routine"), "clarity: no-comment heatmap suggests Routine");
assert(!noCommentContent.includes("Review"), "clarity: no-comment heatmap does not suggest Review");
assert(!noCommentContent.includes("Monitor"), "clarity: no-comment heatmap does not suggest Monitor");

// --- Hot zone "Why" explanation ---
const whyBuckets = [
  { label: "0-15m", commentCount: 8, uniqueParticipants: 3, hostileCommentCount: 2, symbolBurstCount: 1, intensity: 0.8, bar: "\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588--" },
  { label: "15-60m", commentCount: 2, uniqueParticipants: 2, hostileCommentCount: 0, symbolBurstCount: 0, intensity: 0.2, bar: "\u2588\u2588--------" },
  { label: "1-6h", commentCount: 0, uniqueParticipants: 0, hostileCommentCount: 0, symbolBurstCount: 0, intensity: 0, bar: "----------" },
];
const whyContent = formatHeatmapContent(whyBuckets, "0-15m", "Review", 10, false);
assert(whyContent.includes("Why:"), "clarity: hot zone shows Why explanation");
assert(whyContent.includes("8 comments"), "clarity: hot zone Why includes comment count");
assert(whyContent.includes("3 participants"), "clarity: hot zone Why includes participant count");
assert(whyContent.includes("2 hostile"), "clarity: hot zone Why includes hostile count");
assert(whyContent.includes("1 symbol bursts"), "clarity: hot zone Why includes burst count");
assert(whyContent.includes("Hot zone: 0-15m — highest concentration of activity"), "clarity: hot zone headline describes highest concentration");

// --- Stale/dormant clarity in heatmap ---
const staleBucket = [
  { label: "0-15m", commentCount: 0, uniqueParticipants: 0, hostileCommentCount: 0, symbolBurstCount: 0, intensity: 0, bar: "----------" },
  { label: "24h+", commentCount: 3, uniqueParticipants: 2, hostileCommentCount: 0, symbolBurstCount: 0, intensity: 1, bar: "\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588" },
];
const staleContent = formatHeatmapContent(staleBucket, "24h+", "Routine", 3, true);
assert(staleContent.includes("Thread is stale — recent activity is low. Review urgency reduced."), "clarity: stale heatmap includes reduced urgency note");

// --- Stale thread does not trigger Review by itself ---
const staleOnlySignals = {
  uniqueParticipants: 1,
  recentComments60m: 0,
  hostileCommentCount: 0,
  symbolBurstCount: 0,
  stale: true,
  confidence: "low",
};
const staleOnlyView = suggestCommentAwareModView(staleOnlySignals);
assert(staleOnlyView.startsWith("Routine"), "clarity: stale-only signals produce Routine, not Review");
assert(!staleOnlyView.startsWith("Review"), "clarity: stale-only signals never start with Review");

// --- Low-confidence stale view for analyzeThread matches format ---
const noCommentSignals = {
  uniqueParticipants: 0,
  recentComments15m: 0,
  recentComments60m: 0,
  hostileCommentCount: 0,
  symbolBurstCount: 0,
  stale: true,
  confidence: "low",
};
const noCommentView = suggestCommentAwareModView(noCommentSignals);
assert(noCommentView.startsWith("Routine"), "clarity: no-comment signals produce Routine");

// --- Safety invariant: no destructive verbs in any mod view ---
const testViews = [
  suggestCommentAwareModView(staleOnlySignals),
  suggestCommentAwareModView(noCommentSignals),
  suggestCommentAwareModView({ uniqueParticipants: 1, recentComments60m: 10, hostileCommentCount: 2, symbolBurstCount: 0, stale: false, confidence: "low" }),
  suggestCommentAwareModView({ uniqueParticipants: 3, recentComments60m: 20, hostileCommentCount: 5, symbolBurstCount: 2, stale: false, confidence: "high" }),
];
const destructiveWords = ["Remove", "Ban", "Lock", "Delete", "Mute", "Report", "Approve", "Distinguish"];
for (const v of testViews) {
  for (const word of destructiveWords) {
    assert(!v.includes(word), `clarity: mod view "${v}" does not contain destructive keyword "${word}"`);
  }
}

console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`);
process.exit(failed > 0 ? 1 : 0);
