export interface Student {
  id: string
  name: string
  section: 'Soprano' | 'Alto' | 'Tenor' | 'Bass'
  avgPitchAccuracy: number
  practiceMinutesThisWeek: number
  lastActive: string
  streak: number
}

import type { SongStatus } from '../types/database'

export interface Song {
  id: string
  title: string
  composer: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  voiceParts: ('S' | 'A' | 'T' | 'B')[]
  fileUrl?: string
  fileType?: 'pdf' | 'musicxml'
  createdBy?: string
  assignedClasses?: string[]
  assignedDate: string
  avgCompletion: number
  status: SongStatus
  errorMessage?: string
}

export interface MockClass {
  id: string
  name: string
}

export const mockClasses: MockClass[] = [
  { id: '1', name: 'Concert Choir' },
  { id: '2', name: 'Chamber Ensemble' },
  { id: '3', name: 'Beginning Chorus' },
  { id: '4', name: 'Advanced Treble' },
]

export interface Goal {
  id: string
  title: string
  target: number
  current: number
  unit: string
  dueDate: string
}

export interface Alert {
  id: string
  type: 'warning' | 'info' | 'success'
  message: string
  studentName?: string
  timestamp: string
}

export const students: Student[] = [
  { id: '1', name: 'Maya Johnson', section: 'Soprano', avgPitchAccuracy: 92, practiceMinutesThisWeek: 145, lastActive: '2 hours ago', streak: 12 },
  { id: '2', name: 'Liam Chen', section: 'Tenor', avgPitchAccuracy: 87, practiceMinutesThisWeek: 110, lastActive: '1 day ago', streak: 8 },
  { id: '3', name: 'Ava Rodriguez', section: 'Alto', avgPitchAccuracy: 95, practiceMinutesThisWeek: 200, lastActive: '30 min ago', streak: 21 },
  { id: '4', name: 'Ethan Brooks', section: 'Bass', avgPitchAccuracy: 78, practiceMinutesThisWeek: 45, lastActive: '3 days ago', streak: 2 },
  { id: '5', name: 'Sofia Patel', section: 'Soprano', avgPitchAccuracy: 89, practiceMinutesThisWeek: 130, lastActive: '5 hours ago', streak: 15 },
  { id: '6', name: 'Noah Williams', section: 'Tenor', avgPitchAccuracy: 82, practiceMinutesThisWeek: 90, lastActive: '1 day ago', streak: 6 },
  { id: '7', name: 'Isabella Kim', section: 'Alto', avgPitchAccuracy: 91, practiceMinutesThisWeek: 160, lastActive: '1 hour ago', streak: 18 },
  { id: '8', name: 'James Taylor', section: 'Bass', avgPitchAccuracy: 74, practiceMinutesThisWeek: 30, lastActive: '5 days ago', streak: 0 },
  { id: '9', name: 'Olivia Martinez', section: 'Soprano', avgPitchAccuracy: 88, practiceMinutesThisWeek: 120, lastActive: '4 hours ago', streak: 10 },
  { id: '10', name: 'Lucas Brown', section: 'Tenor', avgPitchAccuracy: 85, practiceMinutesThisWeek: 100, lastActive: '2 days ago', streak: 5 },
]

export const songs: Song[] = [
  { id: '1', title: 'Revolting Children', composer: 'Tim Minchin', difficulty: 'Intermediate', voiceParts: ['S', 'A'], fileType: 'pdf', assignedClasses: ['1', '3'], assignedDate: '2026-02-15', avgCompletion: 64, status: 'ready' },
  { id: '2', title: 'Ode to Joy', composer: 'Beethoven / arr. various', difficulty: 'Beginner', voiceParts: ['S', 'A', 'T', 'B'], fileType: 'musicxml', assignedClasses: ['1'], assignedDate: '2026-02-10', avgCompletion: 82, status: 'ready' },
  { id: '3', title: 'Can You Feel the Love Tonight', composer: 'Elton John / arr. Huff', difficulty: 'Intermediate', voiceParts: ['S', 'A', 'B'], fileType: 'pdf', assignedClasses: ['2'], assignedDate: '2026-02-18', avgCompletion: 47, status: 'pdf_only' },
  { id: '4', title: 'Wanting Memories', composer: 'Ysaye Barnwell', difficulty: 'Intermediate', voiceParts: ['S', 'A', 'T', 'B'], fileType: 'pdf', assignedClasses: ['4'], assignedDate: '2026-02-22', avgCompletion: 0, status: 'processing' },
  { id: '5', title: 'Homeward Bound', composer: 'Marta Keen', difficulty: 'Beginner', voiceParts: ['S', 'A', 'B'], fileType: 'musicxml', assignedClasses: ['3', '1'], assignedDate: '2026-02-08', avgCompletion: 73, status: 'ready' },
  { id: '6', title: 'Sicut Cervus', composer: 'Palestrina', difficulty: 'Advanced', voiceParts: ['S', 'A', 'T', 'B'], fileType: 'pdf', assignedClasses: ['2'], assignedDate: '2026-02-25', avgCompletion: 0, status: 'error', errorMessage: 'Upload interrupted — the file may be corrupted. Please re-upload.' },
]

export const goals: Goal[] = [
  { id: '1', title: 'Weekly practice minutes per student', target: 120, current: 103, unit: 'min', dueDate: '2026-03-01' },
  { id: '2', title: 'Class average pitch accuracy', target: 90, current: 86, unit: '%', dueDate: '2026-03-15' },
  { id: '3', title: 'Complete "Ave Verum Corpus"', target: 100, current: 72, unit: '%', dueDate: '2026-03-08' },
  { id: '4', title: 'All students active this week', target: 10, current: 8, unit: 'students', dueDate: '2026-03-01' },
]

export const alerts: Alert[] = [
  { id: '1', type: 'warning', message: 'has not practiced in 5 days', studentName: 'James Taylor', timestamp: '10 min ago' },
  { id: '2', type: 'success', message: 'hit a 21-day practice streak!', studentName: 'Ava Rodriguez', timestamp: '30 min ago' },
  { id: '3', type: 'warning', message: 'has not practiced in 3 days', studentName: 'Ethan Brooks', timestamp: '2 hours ago' },
  { id: '4', type: 'info', message: 'Class average pitch accuracy improved to 86%', timestamp: '1 day ago' },
  { id: '5', type: 'success', message: 'completed all assigned parts for "Simple Gifts"', studentName: 'Maya Johnson', timestamp: '1 day ago' },
  { id: '6', type: 'info', message: '8 of 10 students practiced this week', timestamp: '2 days ago' },
]

export interface PitchHeatmapNote {
  note: string
  studentCount: number
  tendency: 'sharp' | 'flat' | 'on pitch'
  voiceParts: ('Soprano' | 'Alto' | 'Tenor' | 'Bass')[]
}

export const pitchHeatmapNotes: PitchHeatmapNote[] = [
  { note: 'C4', studentCount: 3, tendency: 'flat', voiceParts: ['Soprano', 'Alto'] },
  { note: 'E4', studentCount: 7, tendency: 'flat', voiceParts: ['Soprano', 'Alto'] },
  { note: 'G4', studentCount: 2, tendency: 'on pitch', voiceParts: ['Soprano'] },
  { note: 'B4', studentCount: 5, tendency: 'sharp', voiceParts: ['Soprano'] },
  { note: 'D5', studentCount: 8, tendency: 'flat', voiceParts: ['Soprano'] },
  { note: 'F4', studentCount: 4, tendency: 'sharp', voiceParts: ['Alto', 'Tenor'] },
  { note: 'A3', studentCount: 6, tendency: 'flat', voiceParts: ['Tenor', 'Bass'] },
  { note: 'E3', studentCount: 1, tendency: 'on pitch', voiceParts: ['Bass'] },
  { note: 'G3', studentCount: 9, tendency: 'sharp', voiceParts: ['Tenor', 'Bass'] },
  { note: 'B3', studentCount: 3, tendency: 'on pitch', voiceParts: ['Alto', 'Tenor'] },
]

export const dashboardStats = {
  totalStudents: 10,
  activePracticers: 8,
  avgPitchAccuracy: 86,
  totalPracticeMinutes: 1130,
  avgMinutesPerStudent: 113,
}
