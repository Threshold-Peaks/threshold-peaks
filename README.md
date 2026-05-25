# Strava Story Kudos Fix

## Dateien kopieren

1. `components/StravaStoryGeneratedCard.tsx`
   nach:
   `components/StravaStoryGeneratedCard.tsx`

2. `app/journal/[slug]/page.tsx`
   nach:
   `app/journal/[slug]/page.tsx`

## Danach ausführen

```powershell
Remove-Item -Recurse -Force .next
npm run dev
```

## Was wurde geändert?

Die bisherige Story-Karte in `page.tsx` war eine reine Server-/Fallback-Karte.
Sie hat die Kudos nur aus `fallbackActivity.kudos` bzw. `fallbackActivity.kudosCount` gelesen.
Jetzt übernimmt eine Client-Komponente den gleichen Look, lädt aber live `/api/strava/activity/[id]`
und bevorzugt `activity.kudosCount` aus deiner API.
