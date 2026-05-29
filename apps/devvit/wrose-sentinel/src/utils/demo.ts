import { Devvit, Context } from "@devvit/public-api";
import { normalizeThingId } from "./id.js";

const SAFETY =
  "No automated action was taken. WROSE Sentinel is analytical only. No Reddit content was modified.";

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

function ctxLine(subreddit: string, postId: string): string {
  return `r/${subreddit} · ${normalizeThingId(postId)}`;
}

export function showDemoAnalyzeForm(
  context: Context,
  subreddit: string,
  postId: string,
  reason?: string,
): void {
  const lines = [
    `# WROSE Analyze Thread (Demo)`,
    `Status: demo_mode | Backend: false | Auto-action: false`,
    ctxLine(subreddit, postId),
    `Suggested view: review`,
    reason ?? `No backend connected. Menu/pipeline working. No live analysis.`,
    SAFETY,
  ];
  showForm(context, "WROSE: Analyze Thread (Demo)", "Info", lines.join("\n"));
}

export function showDemoVolatilityForm(
  context: Context,
  subreddit: string,
  postId: string,
  reason?: string,
): void {
  const lines = [
    `# WROSE Volatility Check (Demo)`,
    `Status: demo_mode | Score: 0.42 | Backend: false | Auto-action: false`,
    ctxLine(subreddit, postId),
    reason ?? `No backend. Pipeline confirmed working. No live scoring.`,
    `Factors: not connected · engine unavailable · menu executed`,
    SAFETY,
  ];
  showForm(context, "WROSE: Volatility Check (Demo)", "Info", lines.join("\n"));
}

function extractHost(url: string | undefined | null): string {
  if (!url) return "";
  const m = url.match(/^https?:\/\/([^\/?#]+)/);
  return m ? m[1] : "invalid";
}

export interface BackendDiagnostics {
  settingPresent: boolean;
  urlType: "missing" | "localhost" | "configured";
  host: string;
  fetchAttempted: boolean;
  fetchResult: "skipped" | "success" | "failed";
  fetchError?: string;
}

export function showDemoCapabilitiesForm(
  context: Context,
  diag?: BackendDiagnostics,
): void {
  const parts: string[] = [
    `# WROSE Capabilities (Demo)`,
    `Status: demo_mode | Backend: false | Auto-action: false`,
  ];
  if (diag) {
    parts.push(
      `Setting: ${diag.settingPresent} | URL: ${diag.urlType}${diag.host ? ` | Host: ${diag.host}` : ""}`,
    );
    parts.push(`Fetch: ${diag.fetchAttempted ? "attempted" : "skipped"} · result: ${diag.fetchResult}`);
    if (diag.fetchError) parts.push(`Error: ${diag.fetchError}`);
  }
  parts.push(
    ``,
    `Available: Analyze Thread · Volatility Check · Capabilities`,
    `Requires backend: live scoring · ingestion · historical`,
    SAFETY,
  );
  showForm(context, "WROSE: About / Capabilities", "Capabilities", parts.join("\n"));
}

export function buildBackendDiagnostics(
  baseUrl: string | undefined | null,
  fetchAttempted: boolean,
  fetchResult: "skipped" | "success" | "failed",
  fetchError?: string,
): BackendDiagnostics {
  const settingPresent = !!baseUrl;
  let urlType: "missing" | "localhost" | "configured";
  if (!settingPresent) {
    urlType = "missing";
  } else if (isLocalhostUrl(baseUrl)) {
    urlType = "localhost";
  } else {
    urlType = "configured";
  }
  const diag: BackendDiagnostics = {
    settingPresent,
    urlType,
    host: extractHost(baseUrl),
    fetchAttempted,
    fetchResult,
  };
  if (fetchError) {
    diag.fetchError = fetchError;
  }
  return diag;
}
