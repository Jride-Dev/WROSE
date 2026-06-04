import { Devvit } from "@devvit/public-api";
import { fetchCapabilities, CapabilitiesResponse } from "../utils/api.js";
import {
  isLocalhostUrl,
  showDemoCapabilitiesForm,
  buildBackendDiagnostics,
} from "../utils/demo.js";
import { showResultForm } from "../utils/forms.js";

const SAFETY = "WROSE Sentinel is analytical only. No Reddit content was modified.";

function showNativeCapabilitiesForm(context: Devvit.Context): void {
  showResultForm(context, {
    title: "WROSE: Capabilities",
    description: "Status: native | Backend: native_devvit",
    sections: [
      {
        label: "Native Devvit (Available Now)",
        content: [
          "· Analyze Thread — thread context, signals, mod view",
          "· Volatility Check — v0.1 native score, factors",
          "· Works without HTTP fetch or external backend",
          "· Real-time Reddit post data",
          "· automated_action_taken: false",
          "",
          "No Reddit content is modified.",
        ].join("\n"),
        lineHeight: 4,
      },
      {
        label: "External WROSE Engine (Requires Backend)",
        content: [
          "· Full WROSE operational signal suite (6+ signals)",
          "· Cross-thread historical analysis",
          "· Sentiment drift over time",
          "· Keyword acceleration tracking",
          "· Activity replay timeline",
          "· Requires approved HTTP fetch domain + backend tunnel",
        ].join("\n"),
        lineHeight: 6,
      },
      {
        label: "Safety",
        content: SAFETY,
        lineHeight: 2,
      },
    ],
  });
}

export async function showCapabilities(
  context: Devvit.Context,
): Promise<void> {
  const baseUrl = (await context.settings.get("wroseApiBaseUrl")) as string | undefined;

  // Default: show native capabilities
  if (isLocalhostUrl(baseUrl) || !baseUrl) {
    showNativeCapabilitiesForm(context);
    return;
  }

  // Optional: try external backend capabilities
  try {
    const data = await fetchCapabilities(baseUrl);
    showLiveCapabilitiesForm(context, data);
  } catch {
    showNativeCapabilitiesForm(context);
  }
}

function showLiveCapabilitiesForm(
  context: Devvit.Context,
  data: CapabilitiesResponse,
): void {
  showResultForm(context, {
    title: "WROSE: Capabilities",
    description: `Status: ok | Backend: external | Auto-action: false | Auto enabled: ${data.automated_actions_enabled}`,
    sections: [
      {
        label: "Actions (External WROSE Engine)",
        content: data.available_actions.map((a: string) => `· ${a}`).join("\n"),
        lineHeight: 3,
      },
      {
        label: "Limits",
        content: data.current_limitations.map((l: string) => `· ${l}`).join("\n"),
        lineHeight: 3,
      },
      {
        label: "Safety",
        content: data.safety_boundaries.map((b: string) => `· ${b}`).join("\n") + "\n" + SAFETY,
        lineHeight: 4,
      },
    ],
  });
}
