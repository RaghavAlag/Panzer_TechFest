# DebugQuest Event Build

DebugQuest is a browser-based bug-hunting challenge for coding events and workshops. Participants progress through staged UI and logic faults, then submit final feedback to complete the run.

## Event Flow
1. Level 1: OTP authentication
2. Level 2: loading/puzzle bypass
3. Level 3: dashboard debugging
4. Level 4: final feedback challenge
5. Completion + leaderboard

## Quick Start
1. Install dependencies:
```bash
npm run install:all
```
2. Configure server env in `server/.env`.
3. Start app:
```bash
npm run dev
```
4. Open `http://localhost:5173`.

## Environment
Use `server/.env.example` as reference.

Required keys:
1. `PORT`
2. `CLIENT_URL`
3. `MAIL_USER`
4. `GMAIL_PASSWORD`

Optional:
1. `FEEDBACK_TO` (defaults to event inbox)

## Core Features
1. OTP login via Gmail app password
2. In-memory progression and hints
3. Real-time leaderboard via Socket.io
4. Final feedback level that emails organizer inbox
5. Attached team stats report in feedback email

## Organizer Notes
1. OTP requires valid Gmail app password credentials.
2. Feedback submissions are sent through the same mail transport.
3. Team stats attachment includes team name, time taken, hints used, bugs found, and level.
4. Challenge behavior intentionally includes controlled broken features for participants to debug.

## Project Structure
```text
debugquest/
  client/
    src/
      components/
      context/
      pages/
      styles/
  server/
    routes/
    socket/
    store/
```

## Documentation
1. Event guide: this file
2. Full solve path: `SOLUTIONS.md`

## License
MIT
