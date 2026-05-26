import React from 'react'

function valueColor(value, thresholds) {
  if (value === 0) return 'text-gray-400'
  if (thresholds) {
    if (thresholds.high && value > thresholds.high) return 'text-red-400'
    if (thresholds.medium && value > thresholds.medium) return 'text-yellow-400'
    if (thresholds.low && value > thresholds.low) return 'text-teal-400'
  }
  return 'text-teal-400'
}

export default function SignalCard({ name, value, explanation, thresholds }) {
  return (
    <div className="bg-navy-800 rounded-lg border border-navy-700 p-4">
      <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">{name}</div>
      <div className={`text-2xl font-bold mb-1 ${valueColor(value, thresholds)}`}>
        {typeof value === 'number' ? value.toFixed(4) : value}
      </div>
      <div className="text-xs text-gray-400 leading-relaxed">{explanation}</div>
    </div>
  )
}
