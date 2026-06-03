const express = require('express');
const Database = require('better-sqlite3');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', apiLimiter);

// Initialize database (use /data for persistent disk on Render, local dir otherwise)
const dbPath = process.env.NODE_ENV === 'production' && require('fs').existsSync('/data')
  ? '/data/hiring.db'
  : path.join(__dirname, 'hiring.db');
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS candidates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    position TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'applied',
    notes TEXT,
    resume_link TEXT,
    source TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  )
`);

// GET all candidates
app.get('/api/candidates', (req, res) => {
  const { status, position, search } = req.query;
  let query = 'SELECT * FROM candidates WHERE 1=1';
  const params = [];

  if (status) {
    query += ' AND status = ?';
    params.push(status);
  }
  if (position) {
    query += ' AND position LIKE ?';
    params.push(`%${position}%`);
  }
  if (search) {
    query += ' AND (name LIKE ? OR email LIKE ? OR notes LIKE ?)';
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  query += ' ORDER BY updated_at DESC';
  const candidates = db.prepare(query).all(...params);
  res.json(candidates);
});

// GET single candidate
app.get('/api/candidates/:id', (req, res) => {
  const candidate = db.prepare('SELECT * FROM candidates WHERE id = ?').get(req.params.id);
  if (!candidate) return res.status(404).json({ error: 'Candidate not found' });
  res.json(candidate);
});

// POST new candidate
app.post('/api/candidates', (req, res) => {
  const { name, email, phone, position, status, notes, resume_link, source } = req.body;
  if (!name || !position) {
    return res.status(400).json({ error: 'Name and position are required' });
  }
  const stmt = db.prepare(`
    INSERT INTO candidates (name, email, phone, position, status, notes, resume_link, source)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const result = stmt.run(name, email || null, phone || null, position, status || 'applied', notes || null, resume_link || null, source || null);
  const candidate = db.prepare('SELECT * FROM candidates WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(candidate);
});

// PUT update candidate
app.put('/api/candidates/:id', (req, res) => {
  const { name, email, phone, position, status, notes, resume_link, source } = req.body;
  const existing = db.prepare('SELECT * FROM candidates WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Candidate not found' });

  const stmt = db.prepare(`
    UPDATE candidates SET
      name = ?, email = ?, phone = ?, position = ?, status = ?,
      notes = ?, resume_link = ?, source = ?, updated_at = datetime('now')
    WHERE id = ?
  `);
  stmt.run(
    name || existing.name,
    email !== undefined ? email : existing.email,
    phone !== undefined ? phone : existing.phone,
    position || existing.position,
    status || existing.status,
    notes !== undefined ? notes : existing.notes,
    resume_link !== undefined ? resume_link : existing.resume_link,
    source !== undefined ? source : existing.source,
    req.params.id
  );
  const candidate = db.prepare('SELECT * FROM candidates WHERE id = ?').get(req.params.id);
  res.json(candidate);
});

// DELETE candidate
app.delete('/api/candidates/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM candidates WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Candidate not found' });
  db.prepare('DELETE FROM candidates WHERE id = ?').run(req.params.id);
  res.json({ message: 'Candidate deleted' });
});

// GET stats
app.get('/api/stats', (req, res) => {
  const total = db.prepare('SELECT COUNT(*) as count FROM candidates').get().count;
  const byStatus = db.prepare('SELECT status, COUNT(*) as count FROM candidates GROUP BY status').all();
  const byPosition = db.prepare('SELECT position, COUNT(*) as count FROM candidates GROUP BY position ORDER BY count DESC LIMIT 10').all();
  res.json({ total, byStatus, byPosition });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Hiring Tracker running on http://localhost:${PORT}`));
