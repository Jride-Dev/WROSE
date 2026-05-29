import { Devvit } from "@devvit/public-api";
import { fetchCapabilities, CapabilitiesResponse } from "../utils/api.js";
import {
  isLocalhostUrl,
  showDemoCapabilitiesForm,
  buildBackendDiagnostics,
} from "../utils/demo.js";
import { showResultForm } from "../utils/forms.js";

const SAFETY = "WROSE Sentinel is analytical only. No Reddit content was modified.";

export async function showCapabilities(
  context: Devvit.Context,
): Promise<void> {
  const baseUrl = (await context.settings.get("wroseApiBaseUrl")) as string | undefined;

  if (isLocalhostUrl(baseUrl)) {
    const diag = buildBackendDiagnostics(baseUrl, false, "skipped");
    showDemoCapabilitiesForm(context, diag);
    return;
  }

  try {
    const data = await fetchCapabilities(baseUrl!);
    showLiveCapabilitiesForm(context, data);
  } catch (err) {
    const diag = buildBackendDiagnostics(
      baseUrl, true, "failed",
      err instanceof Error ? err.message : "Unknown error",
    );
    showDemoCapabilitiesForm(context, diag);
  }
}

function showLiveCapabilitiesForm(
  context: Devvit.Context,
  data: CapabilitiesResponse,
): void {
  showResultForm(context, {
    title: "WROSE: Capabilities",
    description: `Status: ok | Backend: true | Auto-action: false | Auto enabled: ${data.automated_actions_enabled}`,
    sections: [
      {
        label: "Actions",
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
