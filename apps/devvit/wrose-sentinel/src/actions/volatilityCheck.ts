import { Devvit } from "@devvit/public-api";
import { volatilityCheck } from "../utils/api.js";
import { SAFETY_STATEMENT, checkAutomationFlag } from "../utils/safety.js";
import { isLocalhostUrl, showDemoVolatilityForm } from "../utils/demo.js";

export async function handleVolatilityCheck(
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
        title: "WROSE: Volatility Check",
        acceptLabel: "OK",
      },
      () => {},
    );
    context.ui.showForm(errorForm);
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

    const factors =
      data.contributing_factors?.join("\n") ||
      "No significant volatility factors detected.";
    const score = data.volatility_score?.toFixed(4) ?? "N/A";
    const explanation = data.explanation || "No explanation available.";

    const lines: string[] = [
      `# Volatility Check — r/${subreddit}`,
      ``,
      `Score: ${score}`,
      ``,
      `## Contributing Factors`,
      factors,
      ``,
      `## Explanation`,
      explanation,
      ``,
      `---`,
      SAFETY_STATEMENT,
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
      "WROSE API Base URL is configured but the backend did not respond. Falling back to Demo Mode.",
    );
  }
}