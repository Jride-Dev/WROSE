import { Devvit } from "@devvit/public-api";
import { analyzeThread } from "../utils/api.js";
import { SAFETY_STATEMENT, checkAutomationFlag } from "../utils/safety.js";
import { isLocalhostUrl, showDemoAnalyzeForm } from "../utils/demo.js";

export async function handleAnalyzeThread(
  context: Devvit.Context,
): Promise<void> {
  const baseUrl = (await context.settings.get("wroseApiBaseUrl")) as
    | string
    | undefined;
  const subreddit = context.subredditName || "";
  const postId = context.postId || "";

  if (!subreddit || !postId) {
    const errorForm = Devvit.createForm(
      {
        fields: [
          {
            name: "error",
            label: "Missing Data",
            type: "paragraph",
            defaultValue:
              "Could not determine the subreddit or post.\n\nPlease open this menu from a specific post.",
          },
        ],
        title: "WROSE: Analyze Thread",
        acceptLabel: "OK",
      },
      () => {},
    );
    context.ui.showForm(errorForm);
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
      const noDataForm = Devvit.createForm(
        {
          fields: [
            {
              name: "notice",
              label: "No Data",
              type: "paragraph",
              defaultValue:
                `No stored data found for r/${subreddit}.\n\n` +
                `Ingest this subreddit first via the WROSE dashboard, then try again.`,
            },
          ],
          title: "WROSE: No Data Available",
          acceptLabel: "OK",
        },
        () => {},
      );
      context.ui.showForm(noDataForm);
      return;
    }

    const sig = data.signals || {};
    const rec = data.recommended_moderator_view || "No recommendation available.";

    const lines: string[] = [
      `# Thread Analysis — r/${subreddit}`,
      ``,
      `## Signals`,
      `Activity Velocity:    ${sig.activity_velocity ?? "N/A"}`,
      `Sentiment Drift:      ${sig.sentiment_drift ?? "N/A"}`,
      `Keyword Acceleration: ${sig.keyword_acceleration ?? "N/A"}`,
      `Hostility Score:      ${sig.hostility_score ?? "N/A"}`,
      `Controversy Density:  ${sig.controversy_density ?? "N/A"}`,
      `Anomaly Score:        ${sig.anomaly_score ?? "N/A"}`,
      ``,
      `## Recommended View`,
      rec,
      ``,
      `---`,
      SAFETY_STATEMENT,
    ];

    const resultsForm = Devvit.createForm(
      {
        fields: [
          {
            name: "results",
            label: "Analysis Results",
            type: "paragraph",
            defaultValue: lines.join("\n"),
          },
        ],
        title: "WROSE: Analyze Thread",
        acceptLabel: "Done",
      },
      () => {},
    );
    context.ui.showForm(resultsForm);
  } catch {
    showDemoAnalyzeForm(
      context,
      subreddit,
      postId,
      "WROSE API Base URL is configured but the backend did not respond. Falling back to Demo Mode.",
    );
  }
}