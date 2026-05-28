import { Devvit, Context } from "@devvit/public-api";
import { normalizeThingId } from "./id.js";

const DEMO_NOTE =
  "WROSE Sentinel is running in Demo Mode because the backend is not connected.";
const SAFETY_LINE =
  "No automated action was taken. WROSE Sentinel is analytical only.";

export function isLocalhostUrl(url: string | undefined | null): boolean {
  if (!url) return true;
  return /^https?:\/\/(127\.0\.0\.1|localhost)/.test(url);
}

function showForm(
  context: Context,
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
  context: Context,
  subreddit: string,
  postId: string,
  reason?: string,
): void {
  const lines: string[] = [
    `# WROSE Analyze Thread — Demo Mode`,
    ``,
    `Status: demo_mode`,
    `Backend connected: false`,
    `Automated action taken: false`,
    ``,
    `Subreddit: r/${subreddit}`,
    `Post ID: ${normalizeThingId(postId)}`,
    ``,
    `Suggested Moderator View: review`,
    ``,
    reason ?? DEMO_NOTE,
    ``,
    `No live backend analysis was performed.`,
    `This confirms the Devvit menu action, form display, and Reddit context`,
    `integration pipeline is working.`,
    ``,
    `---`,
    SAFETY_LINE,
  ];

  showForm(context, "WROSE: Analyze Thread (Demo)", "Demo Analysis", lines.join("\n"));
}

export function showDemoVolatilityForm(
  context: Context,
  subreddit: string,
  postId: string,
  reason?: string,
): void {
  const lines: string[] = [
    `# WROSE Volatility Check — Demo Mode`,
    ``,
    `Status: demo_mode`,
    `Volatility Score: 0.42 (placeholder)`,
    `Backend connected: false`,
    `Automated action taken: false`,
    ``,
    `Subreddit: r/${subreddit}`,
    `Post ID: ${normalizeThingId(postId)}`,
    ``,
    reason ?? DEMO_NOTE,
    ``,
    `Contributing Factors:`,
    `  - Devvit menu action executed successfully`,
    `  - Backend not connected`,
    `  - Live signal engine unavailable`,
    ``,
    `This confirms the menu action pipeline is working end-to-end.`,
    ``,
    `---`,
    SAFETY_LINE,
  ];

  showForm(context, "WROSE: Volatility Check (Demo)", "Demo Volatility Check", lines.join("\n"));
}

export function showDemoCapabilitiesForm(context: Context): void {
  const lines: string[] = [
    `# WROSE Sentinel — Capabilities (Demo Mode)`,
    ``,
    `Backend connected: false`,
    `Automated action taken: false`,
    ``,
    `## What WROSE Sentinel Can Do (Demo Mode)`,
    `- Display moderator menu items in post and subreddit menus`,
    `- Open analytical result forms on menu click`,
    `- Show thread context (subreddit, post ID)`,
    `- Return safe placeholder analysis data`,
    `- Run without a backend connection or tunnel`,
    ``,
    `## What Requires Backend Connection`,
    `- Live signal scoring (activity velocity, sentiment drift, etc.)`,
    `- Real volatility scoring`,
    `- Subreddit ingestion and data storage`,
    `- Per-thread historical analysis`,
    ``,
    `## Safety Boundaries`,
    `- No automated moderation actions are performed`,
    `- No content is removed, locked, banned, muted, reported, approved, distinguished, or deleted`,
    `- All responses include automated_action_taken: false`,
    `- Analysis only — moderator must review and act`,
    ``,
    `---`,
    SAFETY_LINE,
  ];

  showForm(context, "WROSE: About / Capabilities", "Capabilities", lines.join("\n"));
}
