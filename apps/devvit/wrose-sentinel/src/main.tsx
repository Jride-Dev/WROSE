import { Devvit, SettingScope } from "@devvit/public-api";
import { handleAnalyzeThread } from "./actions/analyzeThread.js";
import { handleVolatilityCheck } from "./actions/volatilityCheck.js";
import { showCapabilities } from "./actions/capabilities.js";
import { showErrorForm } from "./components/ErrorBlock.js";

Devvit.configure({ redditAPI: true });

Devvit.addSettings([
  {
    name: "wroseApiBaseUrl",
    label: "WROSE API Base URL",
    type: "string",
    defaultValue: "http://127.0.0.1:8000",
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
  label: "WROSE: About / Capabilities",
  location: "subreddit",
  forUserType: "moderator",
  description: "Learn what WROSE Sentinel can do, view safety boundaries, and check connection status.",
  onPress: async (_event, context) => {
    try {
      await showCapabilities(context);
    } catch {
      showErrorForm(
        context,
        "WROSE: Error",
        "Could not load capabilities. Ensure the WROSE backend is running.",
      );
    }
  },
});

export default Devvit;
