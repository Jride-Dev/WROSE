import { Devvit } from "@devvit/public-api";
import { analyzeThread } from "../utils/api.js";
import { checkAutomationFlag } from "../utils/safety.js";
import { isLocalhostUrl, showDemoAnalyzeForm } from "../utils/demo.js";
import { showResultForm, showErrorForm } from "../utils/forms.js";
import { normalizeThingId } from "../utils/id.js";
import {
  extractThreadContext,
  buildThreadSummary,
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

async function tryNativeAnalysis(
  context: Devvit.Context,
  subreddit: string,
  postId: string,
): Promise<boolean> {
  try {
    const post = await context.reddit.getPostById(postId);
    const ctx = extractThreadContext(post);
    const summary = buildThreadSummary(ctx);
    const view = suggestModeratorView(ctx.commentCount, ctx.postScore, ctx.upvoteRatio, ctx.postAgeHours);

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
    const commentAwareView = suggestCommentAwareModView(signals);

    const lowActivityNotes: string[] = [];
    if (signals.uniqueParticipants === 0) {
      lowActivityNotes.push("No comment activity detected. Metadata-only signals remain low.");
    } else if (signals.stale) {
      lowActivityNotes.push("Thread is stale — recent activity is low. Review urgency reduced.");
    }

    const signalsContent = [
      `Participants: ${signals.uniqueParticipants}`,
      `Recent: ${signals.recentComments15m} / 15m · ${signals.recentComments60m} / 60m`,
      `Hostile: ${signals.hostileCommentCount}`,
      `Symbol bursts: ${signals.symbolBurstCount}`,
      `Confidence: ${signals.confidence}`,
      `Stale: ${signals.stale}`,
      ...(lowActivityNotes.length > 0 ? ["", ...lowActivityNotes] : []),
    ].join("\n");

    showResultForm(context, {
      title: "WROSE: Analyze Thread",
      description: `Status: native_analysis | Backend: native_devvit`,
      sections: [
        { label: "Post", content: CTX(subreddit, postId) + "\n" + ctx.postTitle, lineHeight: 2 },
        { label: "Thread Context", content: summary, lineHeight: 6 },
        { label: "Comment Signals", content: signalsContent, lineHeight: 6 },
        { label: "Suggested View", content: buildSuggestedViewContent(view, commentAwareView), lineHeight: 3 },
        { label: "Safety", content: SAFETY, lineHeight: 2 },
      ],
    });
    return true;
  } catch {
    return false;
  }
}

export async function handleAnalyzeThread(
  context: Devvit.Context,
): Promise<void> {
  const baseUrl = (await context.settings.get("wroseApiBaseUrl")) as string | undefined;
  const subreddit = context.subredditName || "";
  const postId = context.postId || "";

  if (!subreddit || !postId) {
    showErrorForm(context, "WROSE: Analyze Thread",
      "Could not determine the subreddit or post. Open this menu from a specific post.");
    return;
  }

  // Default: native Devvit analysis (works without HTTP fetch)
  const nativeOk = await tryNativeAnalysis(context, subreddit, postId);
  if (nativeOk) return;

  // Fallback: external backend (only if URL is configured and not localhost)
  if (baseUrl && !isLocalhostUrl(baseUrl)) {
    try {
      const data = await analyzeThread(baseUrl, subreddit, postId);
      checkAutomationFlag(data);

      if (data.status === "no_data") {
        showResultForm(context, {
          title: "WROSE: Analyze Thread",
          description: "Status: no_data | Backend: external | Auto-action: false",
          sections: [
            { label: "Post", content: CTX(subreddit, postId), lineHeight: 2 },
            { label: "Result", content: "No stored data. Run ingestion first via WROSE dashboard.", lineHeight: 2 },
            { label: "Safety", content: SAFETY, lineHeight: 2 },
          ],
        });
        return;
      }

      const sig = data.signals || {};
      const rec = data.recommended_moderator_view || "No recommendation available.";
      showResultForm(context, {
        title: "WROSE: Analyze Thread",
        description: "Status: ok | Backend: external | Auto-action: false",
        sections: [
          { label: "Post", content: CTX(subreddit, postId), lineHeight: 2 },
          { label: "Signals", content: [
            `AV=${sig.activity_velocity ?? "N/A"} SD=${sig.sentiment_drift ?? "N/A"} KA=${sig.keyword_acceleration ?? "N/A"}`,
            `HS=${sig.hostility_score ?? "N/A"} CD=${sig.controversy_density ?? "N/A"} AS=${sig.anomaly_score ?? "N/A"}`,
            `View: ${rec}`,
          ].join("\n"), lineHeight: 3 },
          { label: "Safety", content: SAFETY, lineHeight: 2 },
        ],
      });
      return;
    } catch {
      // External backend failed — try native again or show demo
      const retry = await tryNativeAnalysis(context, subreddit, postId);
      if (retry) return;
    }
  }

  showDemoAnalyzeForm(context, subreddit, postId);
}
