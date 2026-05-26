export const SAFETY_STATEMENT =
  "No automated action was taken. WROSE Sentinel is analytical only.";

export function checkAutomationFlag(response: {
  automated_action_taken?: boolean;
}): void {
  if (response.automated_action_taken !== false) {
    console.warn(
      "Safety invariant violation: automated_action_taken is not false",
      response,
    );
  }
}

export function buildErrorPayload(
  message: string,
): Record<string, string | boolean> {
  return {
    status: "error",
    message,
    automated_action_taken: false,
  };
}

export function buildNoDataPayload(
  subreddit: string,
): Record<string, string | boolean> {
  return {
    status: "no_data",
    message: `No stored data found for r/${subreddit}. Run ingestion first via the WROSE dashboard.`,
    automated_action_taken: false,
  };
}
