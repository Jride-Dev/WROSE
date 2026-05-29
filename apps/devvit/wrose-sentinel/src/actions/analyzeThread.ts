import { Devvit } from "@devvit/public-api";
import { analyzeThread } from "../utils/api.js";
import { checkAutomationFlag } from "../utils/safety.js";
import { isLocalhostUrl, showDemoAnalyzeForm } from "../utils/demo.js";
import { showResultForm, showErrorForm } from "../utils/forms.js";
import { normalizeThingId } from "../utils/id.js";

const SAFETY = "WROSE Sentinel is analytical only. No Reddit content was modified.";
const CTX = (s: string, p: string) => `r/${s} · ${normalizeThingId(p)}`;

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

  if (isLocalhostUrl(baseUrl)) {
    showDemoAnalyzeForm(context, subreddit, postId);
    return;
  }

  try {
    const data = await analyzeThread(baseUrl!, subreddit, postId);
    checkAutomationFlag(data);

    if (data.status === "no_data") {
      showResultForm(context, {
        title: "WROSE: Analyze Thread",
        description: "Status: no_data | Backend: true | Auto-action: false",
        sections: [
          { label: "Post", content: CTX(subreddit, postId), lineHeight: 2 },
          { label: "Result", content: "No stored data. Run ingestion first.", lineHeight: 2 },
          { label: "Safety", content: SAFETY, lineHeight: 2 },
        ],
      });
      return;
    }

    const sig = data.signals || {};
    const rec = data.recommended_moderator_view || "No recommendation available.";
    showResultForm(context, {
      title: "WROSE: Analyze Thread",
      description: "Status: ok | Auto-action: false",
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
  } catch {
    showDemoAnalyzeForm(
      context, subreddit, postId,
      "Backend URL configured but did not respond.",
    );
  }
}
