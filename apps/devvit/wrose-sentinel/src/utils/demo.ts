import { Devvit } from "@devvit/public-api";

const DEMO_NOTE =
  "WROSE Sentinel is running in Demo Mode because the backend is not connected.";
const SAFETY_LINE =
  "No automated action was taken. WROSE Sentinel is analytical only.";

export function isLocalhostUrl(url: string | undefined | null): boolean {
  if (!url) return true;
  return /^https?:\/\/(127\.0\.0\.1|localhost)/.test(url);
}

function showForm(
  context: Devvit.Context,
  title: string,
  label: string,
  content: string,
): void {
  const form = Devvit.createForm(
    {
      fields: [
        {
          name: "results",
          label,
          type: "paragraph",
          defaultValue: content,
        },
      ],
      title,
      acceptLabel: "Done",
    },
    () => {},
  );
  context.ui.showForm(form);
}

export function showDemoAnalyzeForm(
  context: Devvit.Context,
  subreddit: string,
  postId: string,
  reason?: string,
): void {
  const lines: string[] = [
    `# WROSE Analyze Thread — Demo Mode`,
    ``,
    `**Status:** demo_mode`,
    `**Automated action taken:** false`,
    ``,
    reason ?? DEMO_NOTE,
    ``,
    `## Thread Context`,
    `Subreddit: r/${subreddit}`,
    `Post ID: t3_${postId}`,
    ``,
    `## Suggested Moderator View`,
    `review`,
    ``,
    `## What This Means`,
    `This is a local scaffold response. No live backend analysis was performed.`,
    `WROSE Sentinel responded from the Devvit app directly to confirm that`,
    `menu actions, menu items, forms, and Reddit context integration are working.`,
    ``,
    `---`,
    SAFETY_LINE,
  ];

  showForm(context, "WROSE: Analyze Thread (Demo)", "Demo Analysis", lines.join("\n"));
}

export function showDemoVolatilityForm(
  context: Devvit.Context,
  subreddit: string,
  postId: string,
  reason?: string,
): void {
  const lines: string[] = [
    `# WROSE Volatility Check — Demo Mode`,
    ``,
    `**Status:** demo_mode`,
    `**Volatility Score:** 0.42 (placeholder)`,
    `**Automated action taken:** false`,
    ``,
    reason ?? DEMO_NOTE,
    ``,
    `## Thread Context`,
    `Subreddit: r/${subreddit}`,
    `Post ID: t3_${postId}`,
    ``,
    `## Contributing Factors`,
    `- Backend not connected`,
    `- Live signal engine unavailable`,
    `- Devvit menu action executed successfully`,
    ``,
    `## Explanation`,
    `The volatility check requires a live backend connection to score the thread.`,
    `Since the backend is not connected, WROSE Sentinel returned a placeholder`,
    `score to confirm the menu action pipeline is working end-to-end.`,
    ``,
    `---`,
    SAFETY_LINE,
  ];

  showForm(context, "WROSE: Volatility Check (Demo)", "Demo Volatility Check", lines.join("\n"));
}
