# Hiring Tracker

A simple web application to track candidates through your hiring pipeline.

## Features

- **Add/Edit/Delete candidates** with full details (name, email, phone, position, notes)
- **Track status** through the hiring pipeline: Applied → Screening → Interview → Offer → Hired/Rejected/Withdrawn
- **Search & filter** candidates by name, email, status, or position
- **Dashboard stats** showing pipeline overview at a glance
- **Persistent storage** using SQLite (no external database needed)

## Getting Started

### Prerequisites

- Node.js 18+ installed

### Installation

```bash
cd hiring-tracker
npm install
```

### Running

```bash
npm start
```

The app will be available at [http://localhost:3001](http://localhost:3001).

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/candidates` | List all candidates (supports `?status=`, `?position=`, `?search=` query params) |
| GET | `/api/candidates/:id` | Get a single candidate |
| POST | `/api/candidates` | Create a new candidate |
| PUT | `/api/candidates/:id` | Update a candidate |
| DELETE | `/api/candidates/:id` | Delete a candidate |
| GET | `/api/stats` | Get pipeline statistics |

## Candidate Statuses

- `applied` - Initial application received
- `screening` - Phone/resume screening
- `interview` - In interview process
- `offer` - Offer extended
- `hired` - Offer accepted
- `rejected` - Not moving forward
- `withdrawn` - Candidate withdrew
