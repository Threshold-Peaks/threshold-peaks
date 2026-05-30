# Automatische Strava Route-Maps

Journal-Beiträge können eine Strava-Aktivität referenzieren. Ein Sanity Webhook ruft dann die Next.js Route `POST /api/strava/generate-route-map` auf. Die Route erzeugt mit der bestehenden Kartenoptik ein PNG, lädt es als Sanity Image Asset hoch und patcht den `journalPost`.

## Environment Variables

In Vercel und lokal in `.env.local`:

```bash
STRAVA_CLIENT_ID=...
STRAVA_CLIENT_SECRET=...
STRAVA_REFRESH_TOKEN=...
STRAVA_ROUTE_MAP_WEBHOOK_SECRET=...

NEXT_PUBLIC_SANITY_PROJECT_ID=...
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2026-05-11
SANITY_API_WRITE_TOKEN=...
```

`SANITY_API_WRITE_TOKEN` braucht Schreibrechte für Dokumente und Assets im Dataset. Das Webhook Secret ist ein frei gewählter langer Zufallswert und muss in Sanity und Vercel identisch sein.

## Sanity Webhook

Lege in Sanity einen Webhook an:

- URL: `https://www.threshold-peaks.de/api/strava/generate-route-map`
- Method: `POST`
- Dataset: dein produktives Dataset, z. B. `production`
- Trigger: Create und Update
- Filter:

```groq
_type == "journalPost" &&
!(_id in path("drafts.**")) &&
(defined(stravaActivityUrl) || defined(stravaUrl) || defined(stravaActivityId))
```

- Projection:

```groq
{ _id }
```

- Header:

```text
x-strava-route-map-secret: <STRAVA_ROUTE_MAP_WEBHOOK_SECRET>
```

Die API-Route lädt den aktuellen Beitrag selbst aus Sanity. Dadurch reicht die `_id` im Webhook-Payload.

## Loop-Sicherung

Die Route überspringt Generierung, wenn für dieselbe `stravaActivityId` bereits ein `routeMapImage` mit Status `ready` existiert. Außerdem werden eigene Folge-Webhooks mit Status `generating` oder `failed` für dieselbe Aktivität ignoriert. Eine neue Generierung startet erst wieder, wenn sich Link oder Activity ID ändern oder lokal mit `?force=1` getestet wird.

## Vercel

Setze alle Environment Variables in Vercel für Production. Die Route läuft mit Node.js Runtime und `maxDuration = 60`; falls Vercel wegen langer Overpass-Abfragen abbricht, braucht das Projekt einen Plan mit passender Function Duration.

## Lokal testen

1. `.env.local` vollständig befüllen.
2. Dev-Server starten:

```bash
npm run dev
```

3. Einen bekannten `journalPost` mit Strava-Link in Sanity nehmen und die `_id` verwenden:

```powershell
Invoke-RestMethod `
  -Method Post `
  -Uri "http://localhost:3000/api/strava/generate-route-map?force=1" `
  -Headers @{"x-strava-route-map-secret"=$env:STRAVA_ROUTE_MAP_WEBHOOK_SECRET} `
  -ContentType "application/json" `
  -Body '{"_id":"<journalPost-id>"}'
```

4. In Sanity prüfen, ob `routeMapImage`, `routeMapStatus` und `routeMapGeneratedAt` gesetzt wurden.
5. Den Journal-Beitrag öffnen und prüfen, ob die Karte angezeigt wird.

Der manuelle Fallback bleibt erhalten:

```bash
npm run generate-route-map -- 18632640692
npm run generate-route-maps
```
