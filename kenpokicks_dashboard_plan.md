# KenpoKicks Dashboard Development Plan

This plan outlines the core phases, models, and features for building out the KenpoKicks user dashboard and related systems.

---

## Phase 1: User Dashboard Foundation

### Goals:
- Display core user profile data
- Enable profile editing
- Route access control via auth middleware

### Tasks:
- Create `/portal/dashboard` route and controller
- Build `dashboard.pug` with:
  - User avatar
  - Name, rank, email
  - Edit Profile button
  - Links to training resources by belt

---

## Phase 2: Training Resources by Belt

### Goals:
- Organize training content by belt level
- Create interactive belt menu with detail views

### Models:
- `Belt`
  - `id`
  - `name`
  - `rankOrder`
  - `curriculumOverview`

- `TrainingContent`
  - `id`
  - `beltId` (FK)
  - `type` (technique, form, set, basics, etc)
  - `title`
  - `videoUrl` (optional)
  - `description`

### Tasks:
- Belt page: `/portal/training/:belt`
- Render training content by type and section
- Consider collapsing sections with toggle buttons

---

## Phase 3: Training Diary / Log

### Goals:
- Allow users to log completed workouts
- View/edit training logs in dashboard

### Model:
- `TrainingLog`
  - `id`
  - `userUuid`
  - `date`
  - `duration`
  - `category` (techniques, forms, fitness, etc)
  - `description`

### Tasks:
- Build `/portal/log` view
- Add training log form to dashboard (optional modal)
- Display latest 5–10 log entries

---

## Phase 4: Goal Tracker Integration

### Goals:
- Integrate logic from standalone goal app
- Use calendar view to plan training goals

### Related Models (Reused):
- `Goal`
- `GoalLog`

### Tasks:
- Integrate calendar + analytics dashboard
- Link goal entries to training logs (if possible)
- Keep diary and goal log logic separate but cross-referenced

---

## Future Phase: Social / Forum Integration

### Concepts:
- Users can add each other as "Training Partners"
- View partner logs, encourage, comment, etc
- Forum topics by belt or technique

### Models:
- `ForumPost`, `ForumReply`, `TrainingPartner`

### Status:
- Deferred until MVP phases are stable

---

## Additional Suggestions

- Add timezone tracking to training logs
- Rank badges or icons next to user name
- Option to export training logs
- Admin-only controls for belt curriculum editing

---

## Notes

You do *not* need a `Portal` model — this can be routed and handled via controller logic and existing user/session data.