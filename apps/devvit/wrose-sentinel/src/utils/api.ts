const TIMEOUT_MS = 10000;

export interface CapabilitiesResponse {
  available_actions: string[];
  current_limitations: string[];
  safety_boundaries: string[];
  automated_actions_enabled: boolean;
  automated_action_taken: boolean;
}

export interface AnalyzeThreadResponse {
  status: string;
  message?: string;
  summary?: Record<string, { value: number; explanation: string }>;
  signals?: Record<string, number>;
  explanations?: Record<string, string>;
  recommended_moderator_view?: string;
  automated_action_taken: boolean;
}

export interface VolatilityCheckResponse {
  status: string;
  message?: string;
  volatility_score?: number;
  contributing_factors?: string[];
  explanation?: string;
  automated_action_taken: boolean;
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  const mergedHeaders: Record<string, string> = {
    "ngrok-skip-browser-warning": "true",
    ...(options.headers as Record<string, string>),
  };
  try {
    const response = await fetch(url, {
      ...options,
      headers: mergedHeaders,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function fetchCapabilities(
  baseUrl: string,
): Promise<CapabilitiesResponse> {
  const path = "/devvit/capabilities";
  const url = `${baseUrl.replace(/\/+$/, "")}${path}`;
  const res = await fetchWithTimeout(url);
  if (!res.ok) {
    console.log(`WROSE: ${path} HTTP ${res.status} FAIL`);
    throw new Error(`Capabilities request failed: ${res.status}`);
  }
  const data: CapabilitiesResponse = await res.json();
  console.log(
    `WROSE: ${path} HTTP ${res.status} backend_status=${(data as any).status ?? "ok"}`,
  );
  return data;
}

export async function analyzeThread(
  baseUrl: string,
  subreddit: string,
  postId: string,
): Promise<AnalyzeThreadResponse> {
  const path = "/devvit/analyze-thread";
  const url = `${baseUrl.replace(/\/+$/, "")}${path}`;
  const res = await fetchWithTimeout(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ subreddit, post_id: postId }),
  });
  if (!res.ok) {
    console.log(`WROSE: ${path} HTTP ${res.status} FAIL`);
    throw new Error(`Analyze thread request failed: ${res.status}`);
  }
  const data: AnalyzeThreadResponse = await res.json();
  console.log(
    `WROSE: ${path} HTTP ${res.status} backend_status=${data.status}`,
  );
  return data;
}

export async function volatilityCheck(
  baseUrl: string,
  subreddit: string,
  postId: string,
): Promise<VolatilityCheckResponse> {
  const path = "/devvit/volatility-check";
  const url = `${baseUrl.replace(/\/+$/, "")}${path}`;
  const res = await fetchWithTimeout(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ subreddit, post_id: postId }),
  });
  if (!res.ok) {
    console.log(`WROSE: ${path} HTTP ${res.status} FAIL`);
    throw new Error(`Volatility check request failed: ${res.status}`);
  }
  const data: VolatilityCheckResponse = await res.json();
  console.log(
    `WROSE: ${path} HTTP ${res.status} backend_status=${data.status}`,
  );
  return data;
}
