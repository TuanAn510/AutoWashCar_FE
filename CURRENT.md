# CURRENT - AutoWashCar_FE

Last updated: 2026-08-22

## Active project context

- Frontend repo: `C:\Users\AD\AutoWashCar_FE`
- Current branch used for notification work: `feat/notifications-polling`
- Remote: `https://github.com/TuanAn510/AutoWashCar_FE`
- Do not push directly to `main`/`master`; push feature work to the active feature branch unless user explicitly says otherwise.

## Recent work completed

### Notification UX improvements

Implemented and pushed draggable notification dock changes.

Commit pushed:

- `fca1206 feat(notifications): add draggable notification dock`
- Branch pushed: `feat/notifications-polling`

Files changed:

- `src/features/notifications/components/DraggableNotificationDock.tsx`
- `src/app/layouts/app-layout.tsx`
- `src/features/notifications/hooks/useNotifications.ts`

Behavior added:

- Notification button is now draggable around the viewport.
- Supports pointer events for mouse/touch/pen.
- Position is constrained inside the viewport with safe margins.
- Last position is persisted in `localStorage` using key `autowash.notificationDock.position`.
- Dragging suppresses accidental click/open events.
- Existing notification bell visuals and behavior were preserved.
- Notification polling interval was reduced from `10_000ms` to `5_000ms` for faster notification updates.

Verification:

- `npm run build` passed after the notification UX changes.

## Local run notes

Frontend run command used:

```powershell
npm run dev -- --host 0.0.0.0
```

Expected local URL:

- `http://localhost:3000/`

Latest checked local state in session:

- Port `3000` was listening.

Logs used:

- `C:\Users\AD\AutoWashCar_FE\autowash-fe-run.log`
- `C:\Users\AD\AutoWashCar_FE\autowash-fe-run.err.log`

## Related session context

- Designer session `des-1 / ses_fd7ed71d5ffeFvngLGvqaBdsou` completed the notification UX lane.
- Context read by that session included:
  - `src/features/notifications/components/NotificationBell.tsx`
  - `src/features/notifications/hooks/useNotifications.ts`
  - `src/app/layouts/app-layout.tsx`
  - `package.json`

## User preferences learned in this project

- User wants direct execution, not just instructions.
- User asked not to push to `main`; verify current branch before commit/push.
- User prefers fast feedback and local runnable URLs.
- For notification UI, avoid fixed placement that overlaps other buttons; draggable/floating behavior is acceptable.
- For notifications, faster arrival is preferred, but avoid excessive polling load.
