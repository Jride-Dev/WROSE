import { Devvit } from "@devvit/public-api";
import { volatilityCheck } from "../utils/api.js";
import { SAFETY_STATEMENT, checkAutomationFlag } from "../utils/safety.js";

export async function handleVolatilityCheck(
  context: Devvit.Context,
): Promise<void> {
  const baseUrl = (await context.settings.get("wroseApiBaseUrl")) as string;
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

  try {
    const data = await volatilityCheck(baseUrl, subreddit, postId);
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
    const errorForm = Devvit.createForm(
      {
        fields: [
          {
            name: "error",
            label: "Connection Error",
            type: "paragraph",
            defaultValue:
              "WROSE backend is not responding.\n\n" +
              "Ensure your WROSE API server is running.\n" +
              "To configure: open App Settings for WROSE Sentinel.\n\n" +
              "Automated action taken: false",
          },
        ],
        title: "WROSE: Backend Unreachable",
        acceptLabel: "OK",
      },
      () => {},
    );
    context.ui.showForm(errorForm);
  }
}