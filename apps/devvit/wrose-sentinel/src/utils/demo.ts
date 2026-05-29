import { Devvit, Context } from "@devvit/public-api";
import { normalizeThingId } from "./id.js";
import { showResultForm } from "./forms.js";

const SAFETY = "WROSE Sentinel is analytical only. No Reddit content was modified.";
const CTX = (s: string, p: string) => `r/${s} · ${normalizeThingId(p)}`;

export function isLocalhostUrl(url: string | undefined | null): boolean {
  if (!url) return true;
  return /^https?:\/\/(127\.0\.0\.1|localhost)/.test(url);
}

export function showDemoAnalyzeForm(
  context: Context,
  subreddit: string,
  postId: string,
  reason?: string,
): void {
  showResultForm(context, {
    title: "WROSE: Analyze Thread",
    description: "Status: demo_mode | Backend: false | Auto-action: false",
    sections: [
      { label: "Post", content: CTX(subreddit, postId), lineHeight: 2 },
      { label: "Result", content: reason ?? "Demo Mode active. No live backend analysis.", lineHeight: 3 },
      { label: "Safety", content: SAFETY, lineHeight: 2 },
    ],
  });
}

export function showDemoVolatilityForm(
  context: Context,
  subreddit: string,
  postId: string,
  reason?: string,
): void {
  showResultForm(context, {
    title: "WROSE: Volatility Check",
    description: "Status: demo_mode | Score: 0.42 | Backend: false | Auto-action: false",
    sections: [
      { label: "Post", content: CTX(subreddit, postId), lineHeight: 2 },
      { label: "Result", content: [
        reason ?? "Demo Mode active. No live scoring.",
        "Factors: not connected · engine unavailable · menu executed",
      ].join("\n"), lineHeight: 3 },
      { label: "Safety", content: SAFETY, lineHeight: 2 },
    ],
  });
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
  const parts: string[] = [];
  if (diag) {
    parts.push(
      `Setting: ${diag.settingPresent} | URL: ${diag.urlType}${diag.host ? ` | Host: ${diag.host}` : ""}`,
      `Fetch: ${diag.fetchAttempted ? "attempted" : "skipped"} · result: ${diag.fetchResult}`,
    );
    if (diag.fetchError) parts.push(`Error: ${diag.fetchError}`);
  }
  parts.push(
    `Available: Analyze Thread · Volatility Check · Capabilities`,
    `Requires backend: live scoring · ingestion · historical`,
  );
  showResultForm(context, {
    title: "WROSE: Capabilities",
    description: "Status: demo_mode | Backend: false | Auto-action: false",
    sections: [
      { label: "Diagnostics", content: parts.join("\n"), lineHeight: 5 },
      { label: "Safety", content: SAFETY, lineHeight: 2 },
    ],
  });
}

export function buildBackendDiagnostics(
  baseUrl: string | undefined | null,
  fetchAttempted: boolean,
  fetchResult: "skipped" | "success" | "failed",
  fetchError?: string,
): BackendDiagnostics {
  const settingPresent = !!baseUrl;
  let urlType: "missing" | "localhost" | "configured";
  if (!settingPresent) urlType = "missing";
  else if (isLocalhostUrl(baseUrl)) urlType = "localhost";
  else urlType = "configured";
  const diag: BackendDiagnostics = { settingPresent, urlType, host: extractHost(baseUrl), fetchAttempted, fetchResult };
  if (fetchError) diag.fetchError = fetchError;
  return diag;
}
