import { Devvit } from "@devvit/public-api";
import { volatilityCheck } from "../utils/api.js";
import { checkAutomationFlag } from "../utils/safety.js";
import { isLocalhostUrl, showDemoVolatilityForm } from "../utils/demo.js";
import { showResultForm, showErrorForm } from "../utils/forms.js";
import { normalizeThingId } from "../utils/id.js";
import {
  extractThreadContext,
  computeVolatilityScore,
  suggestModeratorView,
  extractCommentSignals,
  suggestCommentAwareModView,
} from "../utils/native.js";
import type { NativeCommentInput } from "../utils/native.js";

const SAFETY = "WROSE Sentinel is analytical only. No Reddit content was modified.";
const CTX = (s: string, p: string) => `r/${s} · ${normalizeThingId(p)}`;

function buildSuggestedViewContent(baseline: string, commentAware: string): string {
  const primary = `Suggested moderator view: ${commentAware}`;
  const meta = `Baseline metadata view: ${baseline}`;
  if (baseline === commentAware) return `${primary}\n${meta}`;
  return `${primary}\n${meta}\nComment-aware override: ${commentAware}`;
}

async function tryNativeVolatility(
  context: Devvit.Context,
  subreddit: string,
  postId: string,
): Promise<boolean> {
  try {
    const post = await context.reddit.getPostById(postId);
    const ctx = extractThreadContext(post);
    const { score, factors, explanation } = computeVolatilityScore(
      ctx.commentCount,
      ctx.postScore,
      ctx.upvoteRatio,
      ctx.postAgeHours,
    );

    const rawComments = await context.reddit.getComments({
      postId,
      limit: 100,
      pageSize: 100,
    }).all();

    const mapped: NativeCommentInput[] = rawComments.map((c) => ({
      authorName: c.authorName,
      body: c.body,
      createdAt: c.createdAt,
      score: c.score,
    }));

    const signals = extractCommentSignals(mapped, ctx.postAuthor, new Date());
    const baselineView = suggestModeratorView(ctx.commentCount, ctx.postScore, ctx.upvoteRatio, ctx.postAgeHours);
    const modView = suggestCommentAwareModView(signals);

    const allFactors = [...factors];
    if (signals.hostileCommentCount > 0) allFactors.push(`Hostile: ${signals.hostileCommentCount}`);
    if (signals.symbolBurstCount > 0) allFactors.push(`Symbol bursts: ${signals.symbolBurstCount}`);
    if (signals.recentComments60m >= 5) allFactors.push(`Active: ${signals.recentComments60m}/hr`);
    if (signals.stale) allFactors.push("Stale thread");
    if (signals.confidence === "low") allFactors.push("Low confidence (small sample)");

    const signalsContent = [
      `Participants: ${signals.uniqueParticipants}`,
      `Recent: ${signals.recentComments15m} / 15m · ${signals.recentComments60m} / 60m`,
      `Hostile: ${signals.hostileCommentCount}`,
      `Symbol bursts: ${signals.symbolBurstCount}`,
      `Confidence: ${signals.confidence}`,
      `Stale: ${signals.stale}`,
    ].join("\n");

    showResultForm(context, {
      title: "WROSE: Volatility Check",
      description: `Status: native_analysis | Score: ${score.toFixed(4)} | Backend: native_devvit`,
      sections: [
        { label: "Post", content: CTX(subreddit, postId), lineHeight: 2 },
        { label: "Result", content: `Factors: ${allFactors.join(" · ") || "None significant"}`, lineHeight: 2 },
        { label: "Detail", content: explanation, lineHeight: 3 },
        { label: "Comment Signals", content: signalsContent, lineHeight: 6 },
        { label: "Suggested View", content: buildSuggestedViewContent(baselineView, modView), lineHeight: 3 },
        { label: "Safety", content: SAFETY, lineHeight: 2 },
      ],
    });
    return true;
  } catch {
    return false;
  }
}

export async function handleVolatilityCheck(
  context: Devvit.Context,
): Promise<void> {
  const baseUrl = (await context.settings.get("wroseApiBaseUrl")) as string | undefined;
  const subreddit = context.subredditName || "";
  const postId = context.postId || "";

  if (!subreddit || !postId) {
    showErrorForm(context, "WROSE: Volatility Check",
      "Could not determine the subreddit or post. Open this menu from a specific post.");
    return;
  }

  // Default: native Devvit analysis (works without HTTP fetch)
  const nativeOk = await tryNativeVolatility(context, subreddit, postId);
  if (nativeOk) return;

  // Fallback: external backend (only if URL is configured and not localhost)
  if (baseUrl && !isLocalhostUrl(baseUrl)) {
    try {
      const data = await volatilityCheck(baseUrl, subreddit, postId);
      checkAutomationFlag(data);

      if (data.status === "no_data") {
        showResultForm(context, {
          title: "WROSE: Volatility Check",
          description: "Status: no_data | Backend: external | Auto-action: false",
          sections: [
            { label: "Post", content: CTX(subreddit, postId), lineHeight: 2 },
            { label: "Result", content: "No stored data. Run ingestion first via WROSE dashboard.", lineHeight: 2 },
            { label: "Safety", content: SAFETY, lineHeight: 2 },
          ],
        });
        return;
      }

      const factors = data.contributing_factors?.join(" · ") || "No significant volatility factors detected.";
      const score = data.volatility_score?.toFixed(4) ?? "N/A";
      const explanation = data.explanation || "No explanation available.";
      showResultForm(context, {
        title: "WROSE: Volatility Check",
        description: `Status: ok | Score: ${score} | Backend: external | Auto-action: false`,
        sections: [
          { label: "Post", content: CTX(subreddit, postId), lineHeight: 2 },
          { label: "Result", content: `Factors: ${factors}`, lineHeight: 2 },
          { label: "Detail", content: explanation, lineHeight: 3 },
          { label: "Safety", content: SAFETY, lineHeight: 2 },
        ],
      });
      return;
    } catch {
      const retry = await tryNativeVolatility(context, subreddit, postId);
      if (retry) return;
    }
  }

  showDemoVolatilityForm(context, subreddit, postId);
}
