import { Devvit } from "@devvit/public-api";
import { volatilityCheck } from "../utils/api.js";
import { checkAutomationFlag } from "../utils/safety.js";
import { isLocalhostUrl, showDemoVolatilityForm } from "../utils/demo.js";
import { normalizeThingId } from "../utils/id.js";

const SAFETY =
  "No automated action was taken. WROSE Sentinel is analytical only. No Reddit content was modified.";

export async function handleVolatilityCheck(
  context: Devvit.Context,
): Promise<void> {
  const baseUrl = (await context.settings.get("wroseApiBaseUrl")) as
    | string
    | undefined;
  const subreddit = context.subredditName || "";
  const postId = context.postId || "";

  if (!subreddit || !postId) {
    showForm(context, "WROSE: Volatility Check",
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
      showForm(context, "WROSE: Volatility Check", [
        "# WROSE Volatility Check",
        "Status: no_data | Backend: true | Auto-action: false",
        `r/${subreddit} · ${normalizeThingId(postId)}`,
        "No stored data. Run ingestion first.",
        "Backend reachable but no data for this subreddit.",
        SAFETY,
      ].join("\n"));
      return;
    }

    const factors =
      data.contributing_factors?.join("\n") ||
      "No significant volatility factors detected.";
    const score = data.volatility_score?.toFixed(4) ?? "N/A";
    const explanation = data.explanation || "No explanation available.";
    showForm(context, "WROSE: Volatility Check", [
      "# WROSE Volatility Check",
      `Status: ok | Score: ${score} | Auto-action: false`,
      `r/${subreddit} · ${normalizeThingId(postId)}`,
      `Factors: ${data.contributing_factors ? data.contributing_factors.join(" · ") : "none"}`,
      `Explanation: ${explanation}`,
      SAFETY,
    ].join("\n"));
  } catch {
    showDemoVolatilityForm(
      context,
      subreddit,
      postId,
      "Backend URL configured but did not respond.",
    );
  }
}

function showForm(context: Devvit.Context, title: string, message: string): void {
  const form = Devvit.createForm(
    {
      fields: [{ name: "results", label: "Info", type: "paragraph", defaultValue: message }],
      title,
      acceptLabel: "Done",
    },
    () => {},
  );
  context.ui.showForm(form);
}
