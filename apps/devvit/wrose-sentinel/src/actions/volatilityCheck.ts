import { Devvit } from "@devvit/public-api";
import { volatilityCheck } from "../utils/api.js";
import { checkAutomationFlag } from "../utils/safety.js";
import { isLocalhostUrl, showDemoVolatilityForm } from "../utils/demo.js";
import { showResultForm, showErrorForm } from "../utils/forms.js";
import { normalizeThingId } from "../utils/id.js";

const SAFETY = "WROSE Sentinel is analytical only. No Reddit content was modified.";
const CTX = (s: string, p: string) => `r/${s} · ${normalizeThingId(p)}`;

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

  if (isLocalhostUrl(baseUrl)) {
    showDemoVolatilityForm(context, subreddit, postId);
    return;
  }

  try {
    const data = await volatilityCheck(baseUrl!, subreddit, postId);
    checkAutomationFlag(data);

    if (data.status === "no_data") {
      showResultForm(context, {
        title: "WROSE: Volatility Check",
        description: "Status: no_data | Backend: true | Auto-action: false",
        sections: [
          { label: "Post", content: CTX(subreddit, postId), lineHeight: 2 },
          { label: "Result", content: "No stored data. Run ingestion first.", lineHeight: 2 },
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
      description: `Status: ok | Score: ${score} | Auto-action: false`,
      sections: [
        { label: "Post", content: CTX(subreddit, postId), lineHeight: 2 },
        { label: "Result", content: `Factors: ${factors}`, lineHeight: 2 },
        { label: "Detail", content: explanation, lineHeight: 3 },
        { label: "Safety", content: SAFETY, lineHeight: 2 },
      ],
    });
  } catch {
    showDemoVolatilityForm(
      context, subreddit, postId,
      "Backend URL configured but did not respond.",
    );
  }
}
