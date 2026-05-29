import { Devvit } from "@devvit/public-api";
import { analyzeThread } from "../utils/api.js";
import { checkAutomationFlag } from "../utils/safety.js";
import { isLocalhostUrl, showDemoAnalyzeForm } from "../utils/demo.js";
import { normalizeThingId } from "../utils/id.js";

const SAFETY =
  "No automated action was taken. WROSE Sentinel is analytical only. No Reddit content was modified.";

export async function handleAnalyzeThread(
  context: Devvit.Context,
): Promise<void> {
  const baseUrl = (await context.settings.get("wroseApiBaseUrl")) as
    | string
    | undefined;
  const subreddit = context.subredditName || "";
  const postId = context.postId || "";

  if (!subreddit || !postId) {
    showForm(context, "WROSE: Analyze Thread",
      "Could not determine the subreddit or post. Open this menu from a specific post.");
    return;
  }

  if (isLocalhostUrl(baseUrl)) {
    showDemoAnalyzeForm(context, subreddit, postId);
    return;
  }

  try {
    const data = await analyzeThread(baseUrl!, subreddit, postId);
    checkAutomationFlag(data);

    if (data.status === "no_data") {
      showForm(context, "WROSE: Analyze Thread", [
        "# WROSE Analyze Thread",
        "Status: no_data | Backend: true | Auto-action: false",
        `r/${subreddit} · ${normalizeThingId(postId)}`,
        "No stored data. Run ingestion first.",
        "Backend reachable but no data for this subreddit.",
        SAFETY,
      ].join("\n"));
      return;
    }

    const sig = data.signals || {};
    const rec = data.recommended_moderator_view || "No recommendation available.";
    showForm(context, "WROSE: Analyze Thread", [
      "# WROSE Analyze Thread",
      "Status: ok | Auto-action: false",
      `r/${subreddit} · ${normalizeThingId(postId)}`,
      `AV=${sig.activity_velocity ?? "N/A"} SD=${sig.sentiment_drift ?? "N/A"} KA=${sig.keyword_acceleration ?? "N/A"}`,
      `HS=${sig.hostility_score ?? "N/A"} CD=${sig.controversy_density ?? "N/A"} AS=${sig.anomaly_score ?? "N/A"}`,
      `View: ${rec}`,
      SAFETY,
    ].join("\n"));
  } catch {
    showDemoAnalyzeForm(
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
