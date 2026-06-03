# Hiring Tracker

A simple web application to track candidates through your hiring pipeline.

## 🚀 One-Click Deploy

Deploy to the cloud with no terminal required:

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/cmccorm7/word-to-pdf)

> After clicking, Render will set up the app and give you a public URL you can access from any device.

## Features

- **Add/Edit/Delete candidates** with full details (name, email, phone, position, notes)
- **Track status** through the hiring pipeline: Applied → Screening → Interview → Offer → Hired/Rejected/Withdrawn
- **Search & filter** candidates by name, email, status, or position
- **Dashboard stats** showing pipeline overview at a glance
- **Persistent storage** using SQLite (no external database needed)

## Deployment Options

### Option 1: Render (Recommended — no terminal needed)
1. Click the **Deploy to Render** button above
2. Sign in with your GitHub account
3. Click "Apply" — Render will build and deploy automatically
4. You'll get a public URL like `https://hiring-tracker-xxxx.onrender.com`

### Option 2: Docker
```bash
docker build -t hiring-tracker .
docker run -p 3001:3001 -v hiring-data:/data hiring-tracker
```

### Option 3: Local
```bash
cd hiring-tracker
npm install
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
