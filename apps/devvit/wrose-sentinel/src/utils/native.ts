import { Devvit } from "@devvit/public-api";

export interface NativeThreadContext {
  subreddit: string;
  postId: string;
  postTitle: string;
  postAuthor: string;
  postScore: number;
  upvoteRatio: number;
  commentCount: number;
  postAgeHours: number;
}

export interface NativeAnalyzeResult {
  status: string;
  backend: string;
  subreddit: string;
  normalizedPostId: string;
  threadContext: string;
  suggestedModeratorView: string;
  explanation: string;
  automated_action_taken: boolean;
}

export interface NativeVolatilityResult {
  status: string;
  backend: string;
  volatilityScore: number;
  contributingFactors: string[];
  explanation: string;
  automated_action_taken: boolean;
}

export function extractThreadContext(post: {
  id?: string;
  title?: string;
  authorName?: string;
  score?: number;
  upvoteRatio?: number;
  numberOfComments?: number;
  createdAt?: Date | string | number;
  subredditName?: string;
}): NativeThreadContext {
  const createdAt = post.createdAt instanceof Date ? post.createdAt : new Date(post.createdAt ?? Date.now());
  const ageMs = Date.now() - createdAt.getTime();
  const postAgeHours = Math.max(ageMs / (1000 * 60 * 60), 0.01);

  return {
    subreddit: post.subredditName ?? "",
    postId: post.id ?? "",
    postTitle: post.title ?? "(untitled)",
    postAuthor: post.authorName ?? "unknown",
    postScore: post.score ?? 0,
    upvoteRatio: post.upvoteRatio ?? 0.5,
    commentCount: post.numberOfComments ?? 0,
    postAgeHours,
  };
}

export function computeActivityVelocity(commentCount: number, postAgeHours: number): number {
  return parseFloat((commentCount / Math.max(postAgeHours, 0.01)).toFixed(2));
}

export function computeControversyIndicator(upvoteRatio: number): number {
  return parseFloat((1 - Math.abs(upvoteRatio - 0.5) * 2).toFixed(4));
}

export function computeEngagementRatio(commentCount: number, postScore: number): number {
  return parseFloat((postScore > 0 ? commentCount / postScore : commentCount).toFixed(2));
}

/**
 * v0.1 volatility formula using only Devvit-native context.
 *
 * velocityFactor (0-1): comments per hour, capped at 10/hr.
 * controversyFactor (0-1): 0 when unanimous (0 or 1), 1 when split (0.5).
 * engagementFactor (0-1): comments-to-score ratio, capped at 5.
 *
 * final = velocity * 0.4 + controversy * 0.35 + engagement * 0.25
 */
export function computeVolatilityScore(
  commentCount: number,
  postScore: number,
  upvoteRatio: number,
  postAgeHours: number,
): { score: number; factors: string[]; explanation: string } {
  const safeAge = Math.max(postAgeHours, 0.01);
  const factors: string[] = [];

  const velocity = commentCount / safeAge;
  const velocityFactor = Math.min(velocity / 10, 1);
  if (velocity > 5) {
    factors.push("High comment velocity");
  } else if (velocity > 1) {
    factors.push("Moderate comment velocity");
  }

  const controversyFactor = 1 - Math.abs(upvoteRatio - 0.5) * 2;
  if (controversyFactor > 0.6) {
    factors.push("Controversial voting pattern");
  }

  const er = postScore > 0 ? commentCount / postScore : commentCount;
  const engagementFactor = Math.min(er / 5, 1);
  if (er > 3) {
    factors.push("High engagement relative to score");
  }

  const score = parseFloat(
    (velocityFactor * 0.4 + controversyFactor * 0.35 + engagementFactor * 0.25).toFixed(4),
  );

  const explanation = factors.length > 0
    ? `Volatility=${score}. Factors: ${factors.join(", ")}. (v0.1 native Devvit)`
    : `Volatility=${score}. No significant volatility factors detected. (v0.1 native Devvit)`;

  return { score, factors, explanation };
}

export function suggestModeratorView(
  commentCount: number,
  postScore: number,
  upvoteRatio: number,
  postAgeHours: number,
): string {
  if (commentCount > 50 && postAgeHours < 2) {
    return "Monitor — high activity in short window";
  }
  if (upvoteRatio < 0.6 && postScore > 10) {
    return "Review — controversial high-scoring thread may need moderator attention";
  }
  if (commentCount > 100) {
    return "Review — high comment volume";
  }
  if (upvoteRatio > 0.9) {
    return "No action needed — widely approved by community";
  }
  if (postAgeHours > 24) {
    return "Routine — thread is more than 24 hours old";
  }
  return "Routine — no significant signals detected";
}

export function buildThreadSummary(ctx: NativeThreadContext): string {
  const velocity = computeActivityVelocity(ctx.commentCount, ctx.postAgeHours);
  const engagement = computeEngagementRatio(ctx.commentCount, ctx.postScore);
  const controversy = computeControversyIndicator(ctx.upvoteRatio);
  return [
    `Score: ${ctx.postScore}`,
    `Comments: ${ctx.commentCount}`,
    `Activity: ${velocity}/hr`,
    `Upvote ratio: ${(ctx.upvoteRatio * 100).toFixed(0)}%`,
    `Engagement: ${engagement}`,
    `Controversy: ${controversy}`,
  ].join("\n");
}

export interface NativeCommentInput {
  authorName: string;
  body: string;
  createdAt: Date | string | number;
  score: number;
}

export interface CommentSignalsResult {
  commentsAnalyzed: number;
  uniqueParticipants: number;
  opCommentCount: number;
  recentComments15m: number;
  recentComments60m: number;
  hostileCommentCount: number;
  symbolBurstCount: number;
  latestCommentAt: Date | null;
  stale: boolean;
  confidence: "low" | "medium" | "high";
}

const HOSTILE_TERMS = [
  "bullshit", "garbage", "trash", "idiot", "moron",
  "stupid", "waste", "fuck", "fucking",
];

function containsHostileTerm(body: string): boolean {
  const lower = body.toLowerCase();
  return HOSTILE_TERMS.some((term) => lower.includes(term));
}

function hasSymbolBurst(body: string): boolean {
  return /[^a-zA-Z0-9\s]{8,}/.test(body);
}

export function extractCommentSignals(
  comments: NativeCommentInput[],
  postAuthorName: string,
  now: Date,
): CommentSignalsResult {
  const participants = new Set<string>();
  let opCount = 0;
  let recent15 = 0;
  let recent60 = 0;
  let hostile = 0;
  let symbolBursts = 0;
  let latest: Date | null = null;

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

  let confidence: "low" | "medium" | "high";
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

export function suggestCommentAwareModView(signals: CommentSignalsResult): string {
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
