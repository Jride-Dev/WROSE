import { Devvit } from "@devvit/public-api";
import { volatilityCheck } from "../utils/api.js";
import { SAFETY_STATEMENT, checkAutomationFlag } from "../utils/safety.js";
import { isLocalhostUrl, showDemoVolatilityForm } from "../utils/demo.js";
import { normalizeThingId } from "../utils/id.js";

export async function handleVolatilityCheck(
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
      "WROSE: Volatility Check",
      "Could not determine the subreddit or post.\n\nPlease open this menu from a specific post in your subreddit.",
    );
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
      showForm(
        context,
        "WROSE: Volatility Check",
        `No stored data found for r/${subreddit}.\n\n` +
        `Ingest this subreddit first via the WROSE dashboard, then try again.\n\n` +
        `${SAFETY_STATEMENT}`,
      );
      return;
    }

    const factors =
      data.contributing_factors?.join("\n") ||
      "No significant volatility factors detected.";
    const score = data.volatility_score?.toFixed(4) ?? "N/A";
    const explanation = data.explanation || "No explanation available.";

    const lines: string[] = [
      `# WROSE Volatility Check`,
      ``,
      `Status: ok`,
      `Volatility Score: ${score}`,
      `Automated action taken: false`,
      ``,
      `Context:`,
      `- Subreddit: r/${subreddit}`,
      `- Post ID: ${normalizeThingId(postId)}`,
      ``,
      `Contributing Factors:`,
      factors,
      ``,
      `Explanation:`,
      explanation,
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
            label: "Volatility Results",
            type: "paragraph",
            defaultValue: lines.join("\n"),
          },
        ],
        title: "WROSE: Volatility Check",
        acceptLabel: "Done",
      },
      () => {},
    );
    context.ui.showForm(resultsForm);
  } catch {
    showDemoVolatilityForm(
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
