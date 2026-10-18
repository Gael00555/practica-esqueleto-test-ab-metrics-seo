import Database from 'better-sqlite3'
import { emptyLog, type ExperimentLog, type Variant } from '@/lib/experiment'

const db = new Database('experiment.db')

db.exec(`
  CREATE TABLE IF NOT EXISTS events (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    visitor_id TEXT NOT NULL,
    variant    TEXT NOT NULL CHECK (variant IN ('a', 'b')),
    type       TEXT NOT NULL CHECK (type IN ('impression', 'conversion')),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE UNIQUE INDEX IF NOT EXISTS one_conversion_per_visitor
    ON events (visitor_id) WHERE type = 'conversion';
`)

const insertImpression = db.prepare(
  `INSERT INTO events (visitor_id, variant, type) VALUES (?, ?, 'impression')`,
)

const insertConversion = db.prepare(
  `INSERT OR IGNORE INTO events (visitor_id, variant, type) VALUES (?, ?, 'conversion')`,
)

const selectCounts = db.prepare(
  `SELECT variant, type, COUNT(*) AS total FROM events GROUP BY variant, type`,
)

export function recordImpression(visitorId: string, variant: Variant) {
  insertImpression.run(visitorId, variant)
  console.log(`[impresión] ${variant} · ${visitorId}`)
}

export function recordConversionEvent(visitorId: string, variant: Variant): boolean {
  const result = insertConversion.run(visitorId, variant)
  const inserted = result.changes === 1
  console.log(
    inserted
      ? `[conversión] ${variant} · ${visitorId}`
      : `[conversión repetida, ignorada] ${variant} · ${visitorId}`,
  )
  return inserted
}

export function readLog(): ExperimentLog {
  const log = emptyLog()
  const rows = selectCounts.all() as { variant: string; type: string; total: number }[]
  for (const row of rows) {
    if (row.variant !== 'a' && row.variant !== 'b') continue
    if (row.type === 'impression') log[row.variant].impressions = row.total
    else if (row.type === 'conversion') log[row.variant].conversions = row.total
  }
  return log
}