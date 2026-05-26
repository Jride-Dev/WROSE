const BASE = '/api';

export async function healthCheck() {
  const res = await fetch(`${BASE}/health`);
  return res.json();
}

export async function listSubreddits() {
  const res = await fetch(`${BASE}/subreddits`);
  return res.json();
}

export async function ingestSubreddit(name) {
  const res = await fetch(`${BASE}/ingest/subreddit/${name}`, { method: 'POST' });
  return res.json();
}

export async function getPosts(name) {
  const res = await fetch(`${BASE}/subreddits/${name}/posts`);
  return res.json();
}

export async function getSignals(name) {
  const res = await fetch(`${BASE}/signals/${name}`);
  return res.json();
}

export async function getReplay(name) {
  const res = await fetch(`${BASE}/replay/${name}`);
  return res.json();
}
