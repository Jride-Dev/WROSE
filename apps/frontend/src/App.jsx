import React, { useState, useEffect, useCallback } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import SignalCard from './SignalCard'
import { healthCheck, listSubreddits, ingestSubreddit, getPosts, getSignals, getReplay } from './api'

function App() {
  const [subreddits, setSubreddits] = useState([])
  const [selectedSub, setSelectedSub] = useState('')
  const [inputSub, setInputSub] = useState('')
  const [health, setHealth] = useState(null)
  const [signals, setSignals] = useState(null)
  const [replay, setReplay] = useState([])
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    healthCheck()
      .then(setHealth)
      .catch(() => setHealth({ status: 'offline', database: 'unknown' }))
    loadSubreddits()
  }, [])

  function loadSubreddits() {
    listSubreddits().then(setSubreddits).catch(() => setSubreddits([]))
  }

  const selectSubreddit = useCallback((name) => {
    setSelectedSub(name)
    setInputSub(name)
    setError('')
    setMessage('')
    getSignals(name).then(setSignals).catch(() => setSignals(null))
    getPosts(name).then(setPosts).catch(() => setPosts([]))
    getReplay(name).then(r => setReplay(r.frames || [])).catch(() => setReplay([]))
  }, [])

  async function handleIngest() {
    const name = inputSub.trim().toLowerCase()
    if (!name) return
    setLoading(true)
    setError('')
    setMessage('')
    try {
      const result = await ingestSubreddit(name)
      setMessage(`Ingested ${result.posts_ingested} posts, ${result.comments_ingested} comments (source: ${result.source})`)
      loadSubreddits()
      selectSubreddit(name)
    } catch (e) {
      setError('Ingestion failed. Check backend is running.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-navy-900 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-teal-400 tracking-wider">WROSE</h1>
            <p className="text-sm text-gray-500">Working Reddit Operational Signal Engine</p>
          </div>
          <div className="flex items-center gap-3">
            <div className={`h-2 w-2 rounded-full ${health?.status === 'ok' ? 'bg-teal-400' : 'bg-red-400'}`} />
            <span className="text-xs text-gray-500">
              API: {health?.status ?? 'checking'}
            </span>
          </div>
        </div>

        {/* Subreddit Controls */}
        <div className="bg-navy-800 rounded-lg border border-navy-700 p-4 mb-6">
          <div className="flex gap-3 flex-wrap">
            <input
              className="bg-navy-900 border border-navy-600 rounded px-3 py-2 text-sm text-gray-200 w-64 focus:outline-none focus:border-teal-500"
              placeholder="Enter subreddit name..."
              value={inputSub}
              onChange={(e) => setInputSub(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleIngest()}
            />
            <button
              className="bg-teal-600 hover:bg-teal-500 text-white text-sm px-4 py-2 rounded font-medium disabled:opacity-50"
              onClick={handleIngest}
              disabled={loading || !inputSub.trim()}
            >
              {loading ? 'Ingesting...' : 'Ingest'}
            </button>
          </div>
          {subreddits.length > 0 && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {subreddits.map((s) => (
                <button
                  key={s.name}
                  className={`text-xs px-3 py-1 rounded border ${
                    selectedSub === s.name
                      ? 'bg-teal-600 border-teal-500 text-white'
                      : 'bg-navy-700 border-navy-600 text-gray-400 hover:border-teal-500'
                  }`}
                  onClick={() => selectSubreddit(s.name)}
                >
                  r/{s.name}
                </button>
              ))}
            </div>
          )}
          {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
          {message && <p className="text-teal-400 text-xs mt-2">{message}</p>}
        </div>

        {selectedSub && (
          <>
            {/* Signal Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {signals ? (
                <>
                  <SignalCard
                    name="Activity Velocity"
                    value={signals.snapshot.activity_velocity}
                    explanation={
                      JSON.parse(signals.snapshot.summary_json || '{}')?.activity_velocity?.explanation || ''
                    }
                    thresholds={{ low: 10, medium: 30, high: 50 }}
                  />
                  <SignalCard
                    name="Sentiment Drift"
                    value={signals.snapshot.sentiment_drift}
                    explanation={
                      JSON.parse(signals.snapshot.summary_json || '{}')?.sentiment_drift?.explanation || ''
                    }
                  />
                  <SignalCard
                    name="Keyword Acceleration"
                    value={signals.snapshot.keyword_acceleration}
                    explanation={
                      JSON.parse(signals.snapshot.summary_json || '{}')?.keyword_acceleration?.explanation || ''
                    }
                    thresholds={{ low: 0.3, medium: 0.5, high: 1.0 }}
                  />
                  <SignalCard
                    name="Hostility Score"
                    value={signals.snapshot.hostility_score}
                    explanation={
                      JSON.parse(signals.snapshot.summary_json || '{}')?.hostility_score?.explanation || ''
                    }
                    thresholds={{ low: 0.05, medium: 0.15, high: 0.3 }}
                  />
                  <SignalCard
                    name="Controversy Density"
                    value={signals.snapshot.controversy_density}
                    explanation={
                      JSON.parse(signals.snapshot.summary_json || '{}')?.controversy_density?.explanation || ''
                    }
                    thresholds={{ low: 0.1, medium: 0.3, high: 0.5 }}
                  />
                  <SignalCard
                    name="Anomaly Score"
                    value={signals.snapshot.anomaly_score}
                    explanation={
                      JSON.parse(signals.snapshot.summary_json || '{}')?.anomaly_score?.explanation || ''
                    }
                    thresholds={{ low: 0.1, medium: 0.3, high: 0.6 }}
                  />
                </>
              ) : (
                <p className="text-gray-500 text-sm col-span-full">Ingest a subreddit to see signals.</p>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Activity Chart */}
              <div className="bg-navy-800 rounded-lg border border-navy-700 p-4">
                <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">Activity (Replay Timeline)</h2>
                {replay.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={replay}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e2a4a" />
                      <XAxis dataKey="frame_index" stroke="#4b5563" tick={{ fontSize: 11 }} />
                      <YAxis stroke="#4b5563" tick={{ fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f1535', border: '1px solid #162045', borderRadius: '6px' }}
                        labelStyle={{ color: '#9ca3af' }}
                      />
                      <Line type="monotone" dataKey="activity_count" stroke="#2dd4bf" strokeWidth={2} dot={false} name="Activity" />
                      <Line type="monotone" dataKey="hostility_score" stroke="#8b5cf6" strokeWidth={2} dot={false} name="Hostility" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-gray-500 text-xs">No replay data available yet.</p>
                )}
              </div>

              {/* Anomaly Feed */}
              <div className="bg-navy-800 rounded-lg border border-navy-700 p-4">
                <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">Anomaly Feed</h2>
                {signals?.anomalies?.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {signals.anomalies.map((a) => (
                      <div key={a.id} className="text-xs border-l-2 border-surge-400 pl-3 py-1">
                        <span className={`font-medium ${a.severity === 'high' ? 'text-red-400' : a.severity === 'medium' ? 'text-yellow-400' : 'text-teal-400'}`}>
                          [{a.anomaly_type}]
                        </span>
                        <span className="text-gray-400 ml-1">{a.explanation}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-xs">No anomalies detected.</p>
                )}
              </div>
            </div>

            {/* Recent Posts Table */}
            <div className="bg-navy-800 rounded-lg border border-navy-700 p-4 mb-6">
              <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">Recent Posts</h2>
              {posts.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-gray-500 border-b border-navy-700">
                        <th className="text-left py-2 pr-4">Title</th>
                        <th className="text-right px-2">Score</th>
                        <th className="text-right px-2">Comments</th>
                        <th className="text-right pl-4">Author</th>
                      </tr>
                    </thead>
                    <tbody>
                      {posts.slice(0, 15).map((p) => (
                        <tr key={p.id} className="border-b border-navy-700/50 hover:bg-navy-700/30">
                          <td className="py-2 pr-4 text-gray-300 truncate max-w-xs">{p.title}</td>
                          <td className="text-right px-2 text-gray-400">{p.score}</td>
                          <td className="text-right px-2 text-gray-400">{p.num_comments}</td>
                          <td className="text-right pl-4 text-gray-500 font-mono">{p.author_hash}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 text-xs">No posts yet. Ingest a subreddit to populate.</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default App
