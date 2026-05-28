import { Devvit, Context } from "@devvit/public-api";
import { normalizeThingId } from "./id.js";

const SAFETY_LINE =
  "No automated action was taken. WROSE Sentinel is analytical only.";
const NO_MODIFY_LINE =
  "WROSE Sentinel did not modify Reddit content.";

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
    `# WROSE Analyze Thread`,
    ``,
    `Status: demo_mode`,
    `Backend connected: false`,
    `Automated action taken: false`,
    ``,
    `Context:`,
    `- Subreddit: r/${subreddit}`,
    `- Post ID: ${normalizeThingId(postId)}`,
    ``,
    `Result:`,
    `- Demo Mode active — no live backend connected`,
    `- Suggested moderator view: review`,
    ``,
    `Explanation:`,
    reason ? `- ${reason}` : `- WROSE Sentinel is running without a backend connection.`,
    `- The menu action and form display are working correctly.`,
    `- No live signal analysis was performed on this thread.`,
    ``,
    `Safety:`,
    `- ${SAFETY_LINE}`,
    `- ${NO_MODIFY_LINE}`,
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
    `# WROSE Volatility Check`,
    ``,
    `Status: demo_mode`,
    `Volatility Score: 0.42 (placeholder)`,
    `Backend connected: false`,
    `Automated action taken: false`,
    ``,
    `Context:`,
    `- Subreddit: r/${subreddit}`,
    `- Post ID: ${normalizeThingId(postId)}`,
    ``,
    `Result:`,
    `- Demo Mode active — no live backend connected`,
    `- Contributing factors:`,
    `  - Backend not connected`,
    `  - Live signal engine unavailable`,
    `  - Devvit menu action executed successfully`,
    ``,
    `Explanation:`,
    reason ? `- ${reason}` : `- WROSE Sentinel is running without a backend connection.`,
    `- The volatility check pipeline (menu action, API call, response) is confirmed working.`,
    `- No live volatility scoring was performed.`,
    ``,
    `Safety:`,
    `- ${SAFETY_LINE}`,
    `- ${NO_MODIFY_LINE}`,
  ];

  showForm(context, "WROSE: Volatility Check (Demo)", "Demo Volatility Check", lines.join("\n"));
}

export function showDemoCapabilitiesForm(context: Context): void {
  const lines: string[] = [
    `# WROSE Sentinel — Capabilities`,
    ``,
    `Status: demo_mode`,
    `Backend connected: false`,
    `Automated action taken: false`,
    ``,
    `Available in Demo Mode:`,
    `- Analyze Thread — view thread context and placeholder signals`,
    `- Volatility Check — view placeholder volatility score and factors`,
    `- About / Capabilities — this screen`,
    ``,
    `Requires Backend Connection:`,
    `- Live signal scoring (activity velocity, sentiment drift, etc.)`,
    `- Real volatility scoring with backend data`,
    `- Subreddit ingestion and data storage`,
    `- Per-thread historical analysis`,
    ``,
    `Safety:`,
    `- No automated moderation actions are performed`,
    `- No content is removed, locked, banned, muted, reported, approved, distinguished, or deleted`,
    `- All responses include automated_action_taken: false`,
    `- ${NO_MODIFY_LINE}`,
  ];

  showForm(context, "WROSE: About / Capabilities", "Capabilities", lines.join("\n"));
}
