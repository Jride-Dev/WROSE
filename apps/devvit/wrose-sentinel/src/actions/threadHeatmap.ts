import { Devvit } from "@devvit/public-api";
import { showResultForm, showErrorForm } from "../utils/forms.js";
import {
  extractThreadContext,
  extractCommentSignals,
  suggestCommentAwareModView,
  buildHeatmap,
} from "../utils/native.js";
import type { NativeCommentInput, HeatmapBucket } from "../utils/native.js";

const SAFETY = "WROSE Sentinel is analytical only. No Reddit content was modified.";

function formatHeatmapContent(
  buckets: HeatmapBucket[],
  hotZone: string,
  modView: string,
  totalComments: number,
  stale: boolean,
): string {
  if (totalComments === 0) {
    return [
      "No comment activity detected.",
      "Metadata-only signals remain low.",
      "",
      "Suggested moderator view: Routine.",
    ].join("\n");
  }

  const lines = buckets.map((b) => {
    const label = b.label.padEnd(10);
    return `${label}[${b.bar}] ${b.commentCount} comments · ${b.hostileCommentCount} hostile · ${b.symbolBurstCount} bursts`;
  });

  const hotBucket = buckets.find((b) => b.label === hotZone);
  const whyParts: string[] = [];
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

  if (stale) {
    parts.push("Thread is stale — recent activity is low. Review urgency reduced.");
  }

  return parts.join("\n");
}

async function tryNativeHeatmap(
  context: Devvit.Context,
  postId: string,
): Promise<boolean> {
  try {
    const post = await context.reddit.getPostById(postId);
    const ctx = extractThreadContext(post);

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
    const modView = suggestCommentAwareModView(signals);
    const heatmap = buildHeatmap(mapped, ctx.postAuthor, new Date());
    const content = formatHeatmapContent(heatmap.buckets, heatmap.hotZone, modView, heatmap.totalComments, signals.stale);

    showResultForm(context, {
      title: "WROSE: Thread Heatmap",
      description: "Status: native_analysis | Backend: native_devvit",
      sections: [
        { label: "Heatmap", content, lineHeight: 10 },
        { label: "Safety", content: SAFETY, lineHeight: 2 },
      ],
    });
    return true;
  } catch {
    return false;
  }
}

export async function handleThreadHeatmap(
  context: Devvit.Context,
): Promise<void> {
  const subreddit = context.subredditName || "";
  const postId = context.postId || "";

  if (!subreddit || !postId) {
    showErrorForm(context, "WROSE: Thread Heatmap",
      "Could not determine the subreddit or post. Open this menu from a specific post.");
    return;
  }

  const nativeOk = await tryNativeHeatmap(context, postId);
  if (!nativeOk) {
    showErrorForm(context, "WROSE: Thread Heatmap",
      "Could not analyze thread heatmap. Please try again.");
  }
}
