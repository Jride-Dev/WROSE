import { Devvit } from "@devvit/public-api";
import { handleAnalyzeThread } from "./actions/analyzeThread.js";
import { handleVolatilityCheck } from "./actions/volatilityCheck.js";
import { showCapabilities } from "./actions/capabilities.js";
import { showErrorForm } from "./components/ErrorBlock.js";

Devvit.configure({ redditAPI: true });

Devvit.addMenuItem({
  label: "WROSE: Analyze Thread",
  location: "post",
  forUserType: "moderator",
  onPress: async (_event, context) => {
    await handleAnalyzeThread(context);
  },
});

Devvit.addMenuItem({
  label: "WROSE: Volatility Check",
  location: "post",
  forUserType: "moderator",
  onPress: async (_event, context) => {
    await handleVolatilityCheck(context);
  },
});

Devvit.addMenuItem({
  label: "WROSE: About / Capabilities",
  location: "subreddit",
  forUserType: "moderator",
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
