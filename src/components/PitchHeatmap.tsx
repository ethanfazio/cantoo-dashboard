import { useState, useRef } from 'react'
import { pitchHeatmapNotes, type PitchHeatmapNote } from '../lib/mockData'

type Clef = 'treble' | 'bass'
type VoicePart = 'All' | 'Soprano' | 'Alto' | 'Tenor' | 'Bass'

const LINE_SPACING = 15
const HALF_STEP = LINE_SPACING / 2 // 7.5px per diatonic step
const STAFF_LINES = [60, 75, 90, 105, 120] // Y positions of 5 staff lines
const STAFF_LEFT = 70
const STAFF_RIGHT = 570

// Diatonic note names in ascending order (no accidentals)
const DIATONIC = ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as const

function diatonicIndex(note: string): number {
  const letter = note.replace(/\d/, '')
  const octave = parseInt(note.replace(/[A-G]/, ''), 10)
  return octave * 7 + DIATONIC.indexOf(letter as typeof DIATONIC[number])
}

function noteY(note: string, clef: Clef): number {
  const idx = diatonicIndex(note)
  // Treble: E4 (index 30) sits on bottom line (Y=120)
  // Bass: G2 (index 18) sits on bottom line (Y=120)
  const refIdx = clef === 'treble' ? diatonicIndex('E4') : diatonicIndex('G2')
  const stepsAboveRef = idx - refIdx
  return 120 - stepsAboveRef * HALF_STEP
}

function noteColor(count: number): string {
  if (count <= 3) return '#2A9D8F' // teal / primary
  if (count <= 6) return '#E9C46A' // amber
  return '#E76F51'                  // coral
}

function noteRadius(count: number): number {
  const min = 6, max = 14, capCount = 10
  return min + (max - min) * (Math.min(count, capCount) / capCount)
}

function ledgerLines(y: number): number[] {
  const lines: number[] = []
  // Lines below staff (Y > 120)
  for (let ly = 120 + LINE_SPACING; ly <= y; ly += LINE_SPACING) {
    lines.push(ly)
  }
  // Lines above staff (Y < 60)
  for (let ly = 60 - LINE_SPACING; ly >= y; ly -= LINE_SPACING) {
    lines.push(ly)
  }
  return lines
}

// Compact stylized treble clef SVG path
function TrebleClef() {
  return (
    <g transform="translate(20, 52) scale(0.36)">
      <text
        fontSize="120"
        fontFamily="serif"
        fill="#1C1C1E"
        dominantBaseline="hanging"
      >
        {'\u{1D11E}'}
      </text>
    </g>
  )
}

// Compact stylized bass clef SVG path
function BassClef() {
  return (
    <g transform="translate(20, 55) scale(0.36)">
      <text
        fontSize="120"
        fontFamily="serif"
        fill="#1C1C1E"
        dominantBaseline="hanging"
      >
        {'\u{1D122}'}
      </text>
    </g>
  )
}

interface TooltipData {
  note: string
  studentCount: number
  tendency: string
  x: number
  y: number
}

export default function PitchHeatmap() {
  const [clef, setClef] = useState<Clef>('treble')
  const [voicePart, setVoicePart] = useState<VoicePart>('All')
  const [tooltip, setTooltip] = useState<TooltipData | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  const filtered = pitchHeatmapNotes.filter(
    (n) => voicePart === 'All' || n.voiceParts.includes(voicePart as Exclude<VoicePart, 'All'>),
  )

  // Sort by diatonic index so X positions reflect pitch order
  const sorted = [...filtered].sort((a, b) => diatonicIndex(a.note) - diatonicIndex(b.note))

  const xStep = sorted.length > 1 ? (STAFF_RIGHT - STAFF_LEFT) / (sorted.length - 1) : 0

  function handleMouseEnter(n: PitchHeatmapNote, svgX: number, svgY: number) {
    if (!svgRef.current) return
    const svgRect = svgRef.current.getBoundingClientRect()
    const scaleX = svgRect.width / 600
    const scaleY = svgRect.height / 200
    setTooltip({
      note: n.note,
      studentCount: n.studentCount,
      tendency: n.tendency,
      x: svgX * scaleX,
      y: svgY * scaleY,
    })
  }

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      {/* Header with controls */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold font-heading text-charcoal">Pitch Heatmap</h2>
        <div className="flex items-center gap-4">
          {/* Voice part filter */}
          <select
            value={voicePart}
            onChange={(e) => setVoicePart(e.target.value as VoicePart)}
            className="text-sm border border-border rounded-lg px-3 py-1.5 bg-card text-charcoal"
          >
            <option>All</option>
            <option>Soprano</option>
            <option>Alto</option>
            <option>Tenor</option>
            <option>Bass</option>
          </select>

          {/* Clef toggle */}
          <div className="flex rounded-lg border border-border overflow-hidden">
            <button
              onClick={() => setClef('treble')}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                clef === 'treble'
                  ? 'bg-primary text-white'
                  : 'bg-card text-muted hover:text-charcoal'
              }`}
            >
              Treble
            </button>
            <button
              onClick={() => setClef('bass')}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                clef === 'bass'
                  ? 'bg-primary text-white'
                  : 'bg-card text-muted hover:text-charcoal'
              }`}
            >
              Bass
            </button>
          </div>
        </div>
      </div>

      {/* SVG Staff */}
      <div className="relative">
        <svg
          ref={svgRef}
          viewBox="0 0 600 200"
          className="w-full"
          onMouseLeave={() => setTooltip(null)}
        >
          {/* Staff lines */}
          {STAFF_LINES.map((y) => (
            <line
              key={y}
              x1={STAFF_LEFT - 10}
              x2={STAFF_RIGHT + 10}
              y1={y}
              y2={y}
              stroke="#E5E2DC"
              strokeWidth={1}
            />
          ))}

          {/* Clef symbol */}
          {clef === 'treble' ? <TrebleClef /> : <BassClef />}

          {/* Notes */}
          {sorted.map((n, i) => {
            const cx = sorted.length === 1 ? (STAFF_LEFT + STAFF_RIGHT) / 2 : STAFF_LEFT + i * xStep
            const cy = noteY(n.note, clef)
            const r = noteRadius(n.studentCount)
            const ledgers = ledgerLines(cy)

            return (
              <g key={n.note}>
                {/* Ledger lines */}
                {ledgers.map((ly) => (
                  <line
                    key={ly}
                    x1={cx - 16}
                    x2={cx + 16}
                    y1={ly}
                    y2={ly}
                    stroke="#E5E2DC"
                    strokeWidth={1}
                  />
                ))}
                {/* Note circle */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={r}
                  fill={noteColor(n.studentCount)}
                  opacity={0.85}
                  className="cursor-pointer transition-opacity hover:opacity-100"
                  onMouseEnter={() => handleMouseEnter(n, cx, cy)}
                  onMouseLeave={() => setTooltip(null)}
                />
                {/* Note label below */}
                <text
                  x={cx}
                  y={175}
                  textAnchor="middle"
                  fontSize={10}
                  fill="#6B7280"
                >
                  {n.note}
                </text>
              </g>
            )
          })}
        </svg>

        {/* Tooltip */}
        {tooltip && (
          <div
            className="absolute pointer-events-none bg-charcoal text-white text-xs rounded-lg px-3 py-2 shadow-lg"
            style={{
              left: tooltip.x,
              top: tooltip.y - 50,
              transform: 'translateX(-50%)',
            }}
          >
            <p className="font-semibold">{tooltip.note}</p>
            <p>{tooltip.studentCount} student{tooltip.studentCount !== 1 && 's'}</p>
            <p className="capitalize">{tooltip.tendency}</p>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-primary" />
          <span className="text-xs text-muted">Low (1–3)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-amber" />
          <span className="text-xs text-muted">Moderate (4–6)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-coral" />
          <span className="text-xs text-muted">High (7+)</span>
        </div>
      </div>
    </div>
  )
}
