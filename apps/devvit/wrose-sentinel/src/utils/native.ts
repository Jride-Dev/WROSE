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
