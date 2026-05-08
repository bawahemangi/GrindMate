# 🔥 GrindTracker

> Group accountability app for your final year. Track daily DSA, course work, and projects with your friends — with WhatsApp reminders.

## Tech Stack
- **Backend**: Django 4.2 + Django REST Framework + SimpleJWT
- **Frontend**: React 18 + Vite + Tailwind CSS + TanStack Query
- **Database**: PostgreSQL (SQLite in dev)
- **Queue**: Celery + Redis
- **WhatsApp**: Twilio WhatsApp API (mock mode in dev)

---

## 🚀 Quick Start (Local Dev)

### Backend

```bash
cd backend

# Create virtualenv
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install deps
pip install -r requirements.txt

# Set up env
cp .env.example .env
# Edit .env if needed (defaults work for SQLite dev)

# Run migrations
python manage.py migrate

# Create superuser (for Django admin)
python manage.py createsuperuser

# Start server
python manage.py runserver
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at: http://localhost:5173
Django admin: http://localhost:8000/admin

---

## 🐳 Docker (Full Stack)

```bash
# Copy and configure env
cp backend/.env.example backend/.env

# Start everything (DB, Redis, Backend, Celery, Frontend)
docker-compose up --build

# In another terminal, run migrations
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py createsuperuser
docker-compose exec backend python manage.py setup_reminders
```

---

## 📱 WhatsApp Setup

1. Sign up at [Twilio](https://www.twilio.com)
2. Enable the WhatsApp sandbox (free) or apply for a production number
3. Add to `backend/.env`:
   ```
   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxx
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
   ```
4. Each user adds their phone number in Profile and toggles WhatsApp on
5. Run `python manage.py setup_reminders` to schedule daily messages

> **In dev without Twilio keys**, messages are printed to console (mock mode).

---

## ⚙️ Celery Reminders

Reminders run via Celery Beat at:
- **8:00 AM** — Morning task list
- **8:00 PM** — Evening nudge for pending tasks
- **11:00 PM** — Daily summary for the whole group

```bash
# Start workers (separate terminals)
celery -A config worker -l info
celery -A config beat -l info
```

---

## 🗂️ Project Structure

```
grind-tracker/
├── backend/
│   ├── config/          # Django settings, URLs, Celery
│   ├── users/           # Auth, User model, Groups
│   ├── tasks/           # Tasks, completions, stats
│   ├── notifications/   # WhatsApp, Celery tasks, schedules
│   ├── manage.py
│   └── requirements.txt
├── frontend/
│   └── src/
│       ├── api/         # Axios client + API functions
│       ├── components/  # TaskCard, Layout, Modals
│       ├── contexts/    # AuthContext
│       └── pages/       # Dashboard, Group, Leaderboard, Profile
└── docker-compose.yml
```

---

## 🎯 Features

- ✅ Group creation with invite codes
- ✅ Default daily tasks (DSA, Course, Project, Revision)
- ✅ Custom task creation by group admin
- ✅ One-click task completion with ✅ tick
- ✅ Today's progress ring + streak tracker
- ✅ Leaderboard (daily + monthly completions)
- ✅ WhatsApp reminders (3x/day via Twilio)
- ✅ JWT auth with auto-refresh
- ✅ Django admin for managing everything

---

## 🚢 Deploying

**Backend**: Railway, Render, or any VPS (set `DEBUG=False`, proper DB URL)  
**Frontend**: Vercel or Netlify (`VITE_API_URL` pointing to your backend)  
**Redis**: Railway Redis addon or Upstash  

---

## 👥 Workflow

1. One friend creates a group → default tasks are auto-seeded
2. Share the invite code with friends
3. Everyone joins, sets up WhatsApp number in Profile
4. Every day: tick off tasks as you complete them
5. Check the leaderboard to see who's grinding hardest 🔥
