import { Devvit, SettingScope } from "@devvit/public-api";
import { handleAnalyzeThread } from "./actions/analyzeThread.js";
import { handleVolatilityCheck } from "./actions/volatilityCheck.js";
import { handleThreadHeatmap } from "./actions/threadHeatmap.js";
import { showCapabilities } from "./actions/capabilities.js";
import { showErrorForm } from "./utils/forms.js";

Devvit.configure({ redditAPI: true });

Devvit.addSettings([
  {
    name: "wroseApiBaseUrl",
    label: "WROSE API Base URL (optional — native Devvit analysis used by default)",
    type: "string",
    defaultValue: "",
    scope: SettingScope.Installation,
  },
  {
    name: "wroseSafetyStatement",
    label: "Safety Notice (read-only)",
    type: "string",
    defaultValue: "No automated action was taken. WROSE Sentinel is analytical only.",
    scope: SettingScope.Installation,
  },
]);

Devvit.addMenuItem({
  label: "WROSE: Analyze Thread",
  location: "post",
  forUserType: "moderator",
  description: "Review thread activity signals and recommended moderator view. Analytical only — no moderation action taken.",
  onPress: async (_event, context) => {
    await handleAnalyzeThread(context);
  },
});

Devvit.addMenuItem({
  label: "WROSE: Volatility Check",
  location: "post",
  forUserType: "moderator",
  description: "Check thread volatility score and contributing factors. Analytical only — no moderation action taken.",
  onPress: async (_event, context) => {
    await handleVolatilityCheck(context);
  },
});

Devvit.addMenuItem({
  label: "WROSE: Thread Heatmap",
  location: "post",
  forUserType: "moderator",
  description: "View comment concentration heatmap across time windows. Analytical only — no moderation action taken.",
  onPress: async (_event, context) => {
    await handleThreadHeatmap(context);
  },
});

Devvit.addMenuItem({
  label: "WROSE: About / Capabilities",
  location: "subreddit",
  forUserType: "moderator",
  description: "Learn what WROSE Sentinel can do, view safety boundaries, and check capabilities.",
  onPress: async (_event, context) => {
    try {
      await showCapabilities(context);
    } catch {
      showErrorForm(
        context,
        "WROSE: Error",
        "Could not load capabilities.",
      );
    }
  },
});

export default Devvit;
