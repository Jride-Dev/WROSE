import { Devvit } from "@devvit/public-api";
import { fetchCapabilities, CapabilitiesResponse } from "../utils/api.js";
import {
  isLocalhostUrl,
  showDemoCapabilitiesForm,
  buildBackendDiagnostics,
} from "../utils/demo.js";

export async function showCapabilities(
  context: Devvit.Context,
): Promise<void> {
  const baseUrl = (await context.settings.get("wroseApiBaseUrl")) as
    | string
    | undefined;

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
      baseUrl,
      true,
      "failed",
      err instanceof Error ? err.message : "Unknown error",
    );
    showDemoCapabilitiesForm(context, diag);
  }
}

function showLiveCapabilitiesForm(
  context: Devvit.Context,
  data: CapabilitiesResponse,
): void {
  const lines: string[] = [
    `# WROSE Sentinel — Capabilities`,
    ``,
    `Status: ok`,
    `Backend connected: true`,
    `Automated action taken: false`,
    ``,
    `## Available Actions`,
    ...data.available_actions.map((a: string) => `- ${a}`),
    ``,
    `## Limitations`,
    ...data.current_limitations.map((l: string) => `- ${l}`),
    ``,
    `## Safety Boundaries`,
    ...data.safety_boundaries.map((b: string) => `- ${b}`),
    ``,
    `Automated actions enabled: ${data.automated_actions_enabled}`,
    `Automated action taken: ${data.automated_action_taken}`,
  ];

  const form = Devvit.createForm(
    {
      fields: [
        {
          name: "capabilities",
          label: "WROSE Sentinel",
          type: "paragraph",
          defaultValue: lines.join("\n"),
        },
      ],
      title: "WROSE: Capabilities",
      acceptLabel: "Done",
    },
    () => {},
  );

  context.ui.showForm(form);
}
