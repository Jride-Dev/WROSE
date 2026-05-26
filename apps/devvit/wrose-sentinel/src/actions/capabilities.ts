import { Devvit } from "@devvit/public-api";
import { fetchCapabilities } from "../utils/api.js";

export async function showCapabilities(
  context: Devvit.Context,
): Promise<void> {
  const baseUrl = (await context.settings.get("wroseApiBaseUrl")) as string;

  try {
    const data = await fetchCapabilities(baseUrl);

    const lines: string[] = [
      `# WROSE Sentinel — Capabilities`,
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
  } catch {
    const errorForm = Devvit.createForm(
      {
        fields: [
          {
            name: "error",
            label: "Connection Error",
            type: "paragraph",
            defaultValue:
              "WROSE backend is not responding.\n\nEnsure your WROSE API server is running at the configured URL.\n\nTo configure: open App Settings for WROSE Sentinel.",
          },
        ],
        title: "Backend Unreachable",
        acceptLabel: "OK",
      },
      () => {},
    );
    context.ui.showForm(errorForm);
  }
}