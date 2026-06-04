import { Devvit } from "@devvit/public-api";
import { volatilityCheck } from "../utils/api.js";
import { checkAutomationFlag } from "../utils/safety.js";
import { isLocalhostUrl, showDemoVolatilityForm } from "../utils/demo.js";
import { showResultForm, showErrorForm } from "../utils/forms.js";
import { normalizeThingId } from "../utils/id.js";
import {
  extractThreadContext,
  computeVolatilityScore,
} from "../utils/native.js";

const SAFETY = "WROSE Sentinel is analytical only. No Reddit content was modified.";
const CTX = (s: string, p: string) => `r/${s} · ${normalizeThingId(p)}`;

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

    showResultForm(context, {
      title: "WROSE: Volatility Check",
      description: `Status: native_analysis | Score: ${score.toFixed(4)} | Backend: native_devvit`,
      sections: [
        { label: "Post", content: CTX(subreddit, postId), lineHeight: 2 },
        { label: "Result", content: `Factors: ${factors.join(" · ") || "None significant"}`, lineHeight: 2 },
        { label: "Detail", content: explanation, lineHeight: 3 },
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
