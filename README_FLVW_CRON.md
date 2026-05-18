# FLVW Cron Update

Diese Dateien richten eine wöchentliche FLVW-Aktualisierung auf Vercel ein.

## Dateien

- `scripts/import-flvw-events.mjs`
- `app/api/cron/import-flvw/route.ts`
- `vercel.json`

## Zeitplan

`0 6 * * 0`

Das bedeutet: jeden Sonntag um 06:00 Uhr UTC.

## Vercel Environment Variables

Bitte in Vercel setzen:

- `CRON_SECRET`
- `SANITY_API_WRITE_TOKEN`
- `NEXT_PUBLIC_SANITY_PROJECT_ID`
- `NEXT_PUBLIC_SANITY_DATASET`
- optional: `FLVW_MONTHS_AHEAD`
- optional: `FLVW_CRON_DELAY_MS`

## Lokal testen

Der bestehende lokale Import funktioniert weiterhin:

```bash
npm run import:flvw:dry
npm run import:flvw
```

Die Cron-Route lokal zu testen ist wegen `CRON_SECRET` möglich, aber Vercel Cron selbst läuft nur in Production.
