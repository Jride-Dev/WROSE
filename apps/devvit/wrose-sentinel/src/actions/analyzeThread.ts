import { Devvit } from "@devvit/public-api";
import { analyzeThread } from "../utils/api.js";
import { SAFETY_STATEMENT, checkAutomationFlag } from "../utils/safety.js";
import { isLocalhostUrl, showDemoAnalyzeForm } from "../utils/demo.js";
import { normalizeThingId } from "../utils/id.js";

const NO_MODIFY_LINE =
  "WROSE Sentinel did not modify Reddit content.";

export async function handleAnalyzeThread(
  context: Devvit.Context,
): Promise<void> {
  const baseUrl = (await context.settings.get("wroseApiBaseUrl")) as
    | string
    | undefined;
  const subreddit = context.subredditName || "";
  const postId = context.postId || "";

  if (!subreddit || !postId) {
    showForm(
      context,
      "WROSE: Analyze Thread",
      "Could not determine the subreddit or post.\n\nPlease open this menu from a specific post in your subreddit.",
    );
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
      const lines: string[] = [
        `# WROSE Analyze Thread`,
        ``,
        `Status: no_data`,
        `Backend connected: true`,
        `Automated action taken: false`,
        ``,
        `Context:`,
        `- Subreddit: r/${subreddit}`,
        `- Post ID: ${normalizeThingId(postId)}`,
        ``,
        `Result:`,
        `- No stored data found for this subreddit.`,
        `- Run ingestion first via the WROSE dashboard.`,
        ``,
        `Explanation:`,
        `- WROSE reached the backend successfully, but no ingested data`,
        `  exists yet for this subreddit.`,
        ``,
        `Safety:`,
        `- ${SAFETY_STATEMENT}`,
        `- ${NO_MODIFY_LINE}`,
      ];
      showForm(
        context,
        "WROSE: Analyze Thread",
        lines.join("\n"),
      );
      return;
    }

    const sig = data.signals || {};
    const rec = data.recommended_moderator_view || "No recommendation available.";

    const lines: string[] = [
      `# WROSE Analyze Thread`,
      ``,
      `Status: ok`,
      `Automated action taken: false`,
      ``,
      `Context:`,
      `- Subreddit: r/${subreddit}`,
      `- Post ID: ${normalizeThingId(postId)}`,
      ``,
      `Signals:`,
      `- Activity Velocity:    ${sig.activity_velocity ?? "N/A"}`,
      `- Sentiment Drift:      ${sig.sentiment_drift ?? "N/A"}`,
      `- Keyword Acceleration: ${sig.keyword_acceleration ?? "N/A"}`,
      `- Hostility Score:      ${sig.hostility_score ?? "N/A"}`,
      `- Controversy Density:  ${sig.controversy_density ?? "N/A"}`,
      `- Anomaly Score:        ${sig.anomaly_score ?? "N/A"}`,
      ``,
      `Recommended Moderator View: ${rec}`,
      ``,
      `Safety:`,
      `- ${SAFETY_STATEMENT}`,
      `- WROSE Sentinel did not modify Reddit content.`,
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
      "WROSE API Base URL is configured but the backend did not respond.",
    );
  }
}

function showForm(
  context: Devvit.Context,
  title: string,
  message: string,
): void {
  const form = Devvit.createForm(
    {
      fields: [
        {
          name: "error",
          label: "Notice",
          type: "paragraph",
          defaultValue: message,
        },
      ],
      title,
      acceptLabel: "OK",
    },
    () => {},
  );
  context.ui.showForm(form);
}
