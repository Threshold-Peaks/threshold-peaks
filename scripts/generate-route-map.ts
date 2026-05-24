import dotenv from "dotenv";
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

dotenv.config({ path: ".env.local" });

type LatLng = [number, number];

type StravaTokenResponse = {
  access_token: string;
};

type StravaActivity = {
  id: number;
  name: string;
  distance: number;
  moving_time: number;
  total_elevation_gain: number;
  type?: string;
  sport_type?: string;
  start_date?: string;
  start_date_local?: string;
  kudos_count?: number;
};

type StravaActivityMeta = {
  title: string;
  sportType: string;
  dateLabel: string;
  distance: string;
  elevation: string;
  duration: string;
  kudos?: number;
  generatedAt: string;
  mapImage: string;
};

type StravaStreamsResponse = {
  latlng?: {
    data: LatLng[];
  };
};

type GeoJsonCoordinate = [number, number];

type GeoJsonGeometry =
  | {
      type: "Point";
      coordinates: GeoJsonCoordinate;
    }
  | {
      type: "LineString";
      coordinates: GeoJsonCoordinate[];
    }
  | {
      type: "Polygon";
      coordinates: GeoJsonCoordinate[][];
    }
  | {
      type: "MultiLineString";
      coordinates: GeoJsonCoordinate[][];
    }
  | {
      type: "MultiPolygon";
      coordinates: GeoJsonCoordinate[][][];
    };

type GeoJsonFeature = {
  type: "Feature";
  properties: Record<string, string>;
  geometry: GeoJsonGeometry;
};

type OverpassGeometryPoint = {
  lat: number;
  lon: number;
};

type OverpassElement = {
  type?: string;
  lat?: number;
  lon?: number;
  tags?: Record<string, string>;
  geometry?: OverpassGeometryPoint[];
};

type OverpassResponse = {
  elements?: OverpassElement[];
};

type RouteLabelCandidate = {
  x: number;
  y: number;
  distance: number;
};

const WIDTH = 1600;
const HEIGHT = 820;

const ACTIVITY_ID = process.argv[2];

if (!ACTIVITY_ID) {
  console.error(
    "Bitte Strava Activity ID angeben, z. B.: npm run generate-route-map 18632640692",
  );
  process.exit(1);
}

const STRAVA_CLIENT_ID = process.env.STRAVA_CLIENT_ID;
const STRAVA_CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET;
const STRAVA_REFRESH_TOKEN = process.env.STRAVA_REFRESH_TOKEN;

if (!STRAVA_CLIENT_ID || !STRAVA_CLIENT_SECRET || !STRAVA_REFRESH_TOKEN) {
  console.error(
    "Bitte STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET und STRAVA_REFRESH_TOKEN in .env.local setzen.",
  );
  process.exit(1);
}

async function refreshStravaToken() {
  const response = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: STRAVA_CLIENT_ID,
      client_secret: STRAVA_CLIENT_SECRET,
      refresh_token: STRAVA_REFRESH_TOKEN,
      grant_type: "refresh_token",
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Strava Token Fehler: ${response.status} ${text}`);
  }

  const data = (await response.json()) as StravaTokenResponse;
  return data.access_token;
}

async function getActivity(accessToken: string, activityId: string) {
  const response = await fetch(
    `https://www.strava.com/api/v3/activities/${activityId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Strava Activity Fehler: ${response.status} ${text}`);
  }

  return (await response.json()) as StravaActivity;
}

async function getActivityRoute(accessToken: string, activityId: string) {
  const url = `https://www.strava.com/api/v3/activities/${activityId}/streams?keys=latlng&key_by_type=true`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Strava Streams Fehler: ${response.status} ${text}`);
  }

  const data = (await response.json()) as StravaStreamsResponse;

  if (!data.latlng?.data?.length) {
    throw new Error(
      "Keine LatLng-Route gefunden. Prüfe, ob die Aktivität GPS-Daten enthält und dein Token passende Rechte hat.",
    );
  }

  return data.latlng.data;
}

function getBoundingBox(route: LatLng[], padding = 0.006) {
  const lats = route.map(([lat]) => lat);
  const lons = route.map(([, lon]) => lon);

  return {
    south: Math.min(...lats) - padding,
    west: Math.min(...lons) - padding,
    north: Math.max(...lats) + padding,
    east: Math.max(...lons) + padding,
  };
}

async function getOsmData(bbox: ReturnType<typeof getBoundingBox>) {
  const { south, west, north, east } = bbox;

  const query = `
[out:json][timeout:60];
(
  way["waterway"](${south},${west},${north},${east});
  way["natural"="water"](${south},${west},${north},${east});
  way["landuse"="forest"](${south},${west},${north},${east});
  way["natural"="wood"](${south},${west},${north},${east});
  node["place"](${south},${west},${north},${east});
  way["highway"](${south},${west},${north},${east});
);
out geom;
`;

  const endpoints = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
    "https://overpass.openstreetmap.ru/api/interpreter",
  ];

  let lastError = "";

  for (const endpoint of endpoints) {
    console.log(`Overpass-Abfrage über: ${endpoint}`);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "ThresholdPeaksRouteMap/1.0",
        },
        body: new URLSearchParams({ data: query }),
      });

      if (response.ok) {
        return await response.json();
      }

      const text = await response.text();
      lastError = `Overpass Fehler bei ${endpoint}: ${response.status} ${text.slice(
        0,
        500,
      )}`;
      console.warn(lastError);
    } catch (error) {
      lastError = `Overpass Netzwerkfehler bei ${endpoint}: ${String(error)}`;
      console.warn(lastError);
    }
  }

  throw new Error(lastError || "Alle Overpass-Endpunkte sind fehlgeschlagen.");
}

function overpassToFeatures(overpass: OverpassResponse): GeoJsonFeature[] {
  const features: GeoJsonFeature[] = [];

  for (const element of overpass.elements ?? []) {
    if (element.type === "node" && element.lat && element.lon) {
      features.push({
        type: "Feature",
        properties: element.tags ?? {},
        geometry: {
          type: "Point",
          coordinates: [element.lon, element.lat],
        },
      });
    }

    if (element.type === "way" && Array.isArray(element.geometry)) {
      const coords = element.geometry.map(
        (point) => [point.lon, point.lat] as GeoJsonCoordinate,
      );

      const isPolygon =
        coords.length > 2 &&
        coords[0][0] === coords[coords.length - 1][0] &&
        coords[0][1] === coords[coords.length - 1][1];

      if (isPolygon) {
        features.push({
          type: "Feature",
          properties: element.tags ?? {},
          geometry: {
            type: "Polygon",
            coordinates: [coords],
          },
        });
      } else {
        features.push({
          type: "Feature",
          properties: element.tags ?? {},
          geometry: {
            type: "LineString",
            coordinates: coords,
          },
        });
      }
    }
  }

  return features;
}

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function createProjector(route: LatLng[], features: GeoJsonFeature[]) {
  let minLon = Number.POSITIVE_INFINITY;
  let maxLon = Number.NEGATIVE_INFINITY;
  let minLat = Number.POSITIVE_INFINITY;
  let maxLat = Number.NEGATIVE_INFINITY;

  function registerCoord(coord: unknown) {
    if (
      Array.isArray(coord) &&
      coord.length >= 2 &&
      typeof coord[0] === "number" &&
      typeof coord[1] === "number"
    ) {
      const lon = coord[0];
      const lat = coord[1];

      if (lon < minLon) minLon = lon;
      if (lon > maxLon) maxLon = lon;
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
    }
  }

  function registerLine(line: unknown) {
    if (!Array.isArray(line)) return;

    for (const coord of line) {
      registerCoord(coord);
    }
  }

  function registerPolygon(polygon: unknown) {
    if (!Array.isArray(polygon)) return;

    for (const ring of polygon) {
      registerLine(ring);
    }
  }

  for (const [lat, lon] of route) {
    registerCoord([lon, lat]);
  }

  for (const feature of features) {
    const geometry = feature.geometry;

    if (geometry.type === "Point") {
      registerCoord(geometry.coordinates);
    }

    if (geometry.type === "LineString") {
      registerLine(geometry.coordinates);
    }

    if (geometry.type === "Polygon") {
      registerPolygon(geometry.coordinates);
    }

    if (geometry.type === "MultiLineString") {
      for (const line of geometry.coordinates ?? []) {
        registerLine(line);
      }
    }

    if (geometry.type === "MultiPolygon") {
      for (const polygon of geometry.coordinates ?? []) {
        registerPolygon(polygon);
      }
    }
  }

  if (
    !Number.isFinite(minLon) ||
    !Number.isFinite(maxLon) ||
    !Number.isFinite(minLat) ||
    !Number.isFinite(maxLat)
  ) {
    throw new Error("Keine gültigen Koordinaten für die Kartenprojektion gefunden.");
  }

  const lonRange = maxLon - minLon || 1;
  const latRange = maxLat - minLat || 1;

  const padding = 70;
  const scale = Math.min(
    (WIDTH - padding * 2) / lonRange,
    (HEIGHT - padding * 2) / latRange,
  );

  const usedWidth = lonRange * scale;
  const usedHeight = latRange * scale;

  const offsetX = (WIDTH - usedWidth) / 2;
  const offsetY = (HEIGHT - usedHeight) / 2;

  return (lon: number, lat: number) => {
    const x = offsetX + (lon - minLon) * scale;
    const y = HEIGHT - offsetY - (lat - minLat) * scale;
    return [x, y] as [number, number];
  };
}

function pointsToPath(points: [number, number][]) {
  if (!points.length) return "";

  const [first, ...rest] = points;

  return (
    `M ${first[0].toFixed(2)} ${first[1].toFixed(2)} ` +
    rest.map(([x, y]) => `L ${x.toFixed(2)} ${y.toFixed(2)}`).join(" ")
  );
}

function polygonToPoints(points: [number, number][]) {
  return points
    .map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`)
    .join(" ");
}

function distanceSquaredToRoute(
  x: number,
  y: number,
  routePoints: [number, number][],
) {
  let min = Number.POSITIVE_INFINITY;

  for (const [rx, ry] of routePoints) {
    const d = (x - rx) ** 2 + (y - ry) ** 2;
    if (d < min) min = d;
  }

  return min;
}

function getRoutePointAtPercent(
  routePoints: [number, number][],
  percent: number,
) {
  const index = Math.min(
    routePoints.length - 1,
    Math.max(0, Math.floor(routePoints.length * percent)),
  );

  return routePoints[index];
}


function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function choosePlaceLabelPosition({
  x,
  y,
  boxWidth,
  boxHeight,
  routePoints,
}: {
  x: number;
  y: number;
  boxWidth: number;
  boxHeight: number;
  routePoints: [number, number][];
}) {
  const halfWidth = boxWidth / 2;
  const halfHeight = boxHeight / 2;

  const candidates = [
    { dx: 0, dy: -58 },
    { dx: 70, dy: -48 },
    { dx: -70, dy: -48 },
    { dx: 86, dy: 0 },
    { dx: -86, dy: 0 },
    { dx: 70, dy: 48 },
    { dx: -70, dy: 48 },
    { dx: 0, dy: 58 },
    { dx: 118, dy: -72 },
    { dx: -118, dy: -72 },
    { dx: 118, dy: 72 },
    { dx: -118, dy: 72 },
  ];

  let bestCandidate = {
    x: clamp(x, 70 + halfWidth, WIDTH - 70 - halfWidth),
    y: clamp(y - 58, 70 + halfHeight, HEIGHT - 70 - halfHeight),
    score: Number.NEGATIVE_INFINITY,
  };

  for (const candidate of candidates) {
    const candidateX = clamp(x + candidate.dx, 70 + halfWidth, WIDTH - 70 - halfWidth);
    const candidateY = clamp(y + candidate.dy, 70 + halfHeight, HEIGHT - 70 - halfHeight);

    const centerDistance = distanceSquaredToRoute(candidateX, candidateY, routePoints);
    const cornerDistance = Math.min(
      distanceSquaredToRoute(candidateX - halfWidth, candidateY - halfHeight, routePoints),
      distanceSquaredToRoute(candidateX + halfWidth, candidateY - halfHeight, routePoints),
      distanceSquaredToRoute(candidateX - halfWidth, candidateY + halfHeight, routePoints),
      distanceSquaredToRoute(candidateX + halfWidth, candidateY + halfHeight, routePoints),
    );

    const movementPenalty = Math.abs(candidate.dx) * 1.5 + Math.abs(candidate.dy);
    const score = centerDistance + cornerDistance * 0.75 - movementPenalty;

    if (score > bestCandidate.score) {
      bestCandidate = {
        x: candidateX,
        y: candidateY,
        score,
      };
    }
  }

  return {
    x: bestCandidate.x,
    y: bestCandidate.y,
  };
}


function renderMapSvg(
  activity: StravaActivity,
  route: LatLng[],
  features: GeoJsonFeature[],
) {
  const project = createProjector(route, features);

  const routePoints = route.map(([lat, lon]) => project(lon, lat));
  const routePath = pointsToPath(routePoints);

  const forests: string[] = [];
  const waters: string[] = [];
  const roads: string[] = [];
  const waterways: string[] = [];
  const waterLabels: string[] = [];
  const placeLabels: string[] = [];
  const kmMarkers: string[] = [];

  const importantWaters = new Set([
    "Ölbach",
    "Menkebach",
    "Dalke",
    "Alter Ölbach",
    "Neuer Ölbach",
  ]);

  const allowedPlaces = new Set([
    "Verl",
    "Sürenheide",
    "Avenwedde",
    "Friedrichsdorf",
    "Bornholte",
    "Sende",
  ]);

  for (const feature of features) {
    const props = feature.properties ?? {};
    const geometry = feature.geometry;
    const name = props.name as string | undefined;

    if (geometry.type === "Polygon") {
      const ring = geometry.coordinates?.[0];
      if (!Array.isArray(ring)) continue;

      const points = ring.map(([lon, lat]: [number, number]) =>
        project(lon, lat),
      );

      if (props.landuse === "forest" || props.natural === "wood") {
        forests.push(
          `<polygon points="${polygonToPoints(points)}" fill="#98a87d" opacity="0.12" />`,
        );
      }

      if (props.natural === "water") {
        waters.push(
          `<polygon points="${polygonToPoints(points)}" fill="#7baabc" stroke="#608b9a" stroke-width="0.35" opacity="0.22" />`,
        );
      }
    }

    if (geometry.type === "LineString") {
      const points = geometry.coordinates.map(([lon, lat]: [number, number]) =>
        project(lon, lat),
      );

      const path = pointsToPath(points);

      if (props.highway) {
        const roadWidth =
          ["primary", "secondary"].includes(props.highway)
            ? 1.6
            : ["tertiary", "residential", "unclassified"].includes(
                  props.highway,
                )
              ? 1.0
              : 0.6;

        roads.push(
          `<path d="${path}" fill="none" stroke="#8b7d61" stroke-width="${roadWidth + 0.5}" stroke-linecap="round" opacity="0.22" />`,
        );
        roads.push(
          `<path d="${path}" fill="none" stroke="#fff9ec" stroke-width="${roadWidth}" stroke-linecap="round" opacity="0.45" />`,
        );
      }

      if (props.waterway) {
        const important = Boolean(name && importantWaters.has(name));
        const longEnough = points.length > 18;

        if (important || longEnough) {
          waterways.push(
            `<path d="${path}" fill="none" stroke="#5d8fa4" stroke-width="${important ? 1.05 : 0.55}" stroke-linecap="round" opacity="${important ? 0.4 : 0.13}" />`,
          );
        }

        if (important && name) {
          const candidates: RouteLabelCandidate[] = (points as [number, number][])
            .filter(([x, y]: [number, number]) => {
              return x > 70 && x < WIDTH - 70 && y > 70 && y < HEIGHT - 70;
            })
            .map(([x, y]: [number, number]) => ({
              x,
              y,
              distance: distanceSquaredToRoute(x, y, routePoints),
            }))
            .sort((a, b) => b.distance - a.distance);

          const candidate = candidates[0];

          if (candidate && candidate.distance > 900) {
            waterLabels.push(`
              <text x="${candidate.x}" y="${candidate.y - 8}" font-family="Arial, sans-serif" font-size="15" fill="#416f81" opacity="0.76" font-style="italic" text-anchor="middle">
                ${escapeXml(name)}
              </text>
            `);
          }
        }
      }
    }

    if (
      geometry.type === "Point" &&
      props.place &&
      name &&
      allowedPlaces.has(name)
    ) {
      const [x, y] = project(geometry.coordinates[0], geometry.coordinates[1]);

      const fontSize = name === "Verl" || name === "Sürenheide" ? 20 : 16;
      const fontWeight = name === "Verl" || name === "Sürenheide" ? 700 : 400;
      const boxWidth = name.length * 9 + 34;
      const boxHeight = 34;

      const manualPlaceLabelOffsets: Record<string, { dx: number; dy: number }> = {
        Verl: { dx: 92, dy: -72 },
        Sürenheide: { dx: -36, dy: -64 },
        Avenwedde: { dx: -72, dy: -58 },
        Friedrichsdorf: { dx: 0, dy: -62 },
        Sende: { dx: 0, dy: -58 },
        Bornholte: { dx: 0, dy: -58 },
      };

      const manualOffset = manualPlaceLabelOffsets[name];

      const labelPosition = manualOffset
        ? {
            x: clamp(
              x + manualOffset.dx,
              70 + boxWidth / 2,
              WIDTH - 70 - boxWidth / 2,
            ),
            y: clamp(
              y + manualOffset.dy,
              70 + boxHeight / 2,
              HEIGHT - 70 - boxHeight / 2,
            ),
          }
        : choosePlaceLabelPosition({
            x,
            y,
            boxWidth,
            boxHeight,
            routePoints,
          });

      placeLabels.push(`
        <g>
          <rect x="${labelPosition.x - boxWidth / 2}" y="${labelPosition.y - boxHeight / 2}" width="${boxWidth}" height="${boxHeight}" rx="8" fill="#f5f3ee" stroke="#242b32" stroke-width="1.15" opacity="1" />
          <text x="${labelPosition.x}" y="${labelPosition.y + 5}" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="${fontWeight}" fill="#242b32" text-anchor="middle" opacity="1">
            ${escapeXml(name)}
          </text>
        </g>
      `);
    }
  }

  const start = routePoints[0];
  const end = routePoints[routePoints.length - 1];

  const markerPositions = [
    { label: "5 km", percent: 0.33 },
    { label: "10 km", percent: 0.66 },
    { label: "15 km", percent: 0.94 },
  ];

  for (const marker of markerPositions) {
    const [x, y] = getRoutePointAtPercent(routePoints, marker.percent);

    kmMarkers.push(`
      <g>
        <circle cx="${x}" cy="${y}" r="6" fill="#faf5e9" stroke="#10161d" stroke-width="1.4" />
        <rect x="${x + 10}" y="${y - 18}" width="50" height="24" rx="6" fill="#faf5e9" stroke="#10161d" stroke-width="0.7" opacity="0.9" />
        <text x="${x + 35}" y="${y - 2}" font-family="Arial, sans-serif" font-size="12" fill="#10161d" text-anchor="middle">${marker.label}</text>
      </g>
    `);
  }

  return `
<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${WIDTH}" height="${HEIGHT}" fill="#f3efe6" />

  <g opacity="0.16">
    <path d="M 80 160 C 300 120, 440 210, 660 150 S 1050 120, 1450 190" fill="none" stroke="#d4c7aa" stroke-width="1.1" />
    <path d="M 120 360 C 330 310, 520 420, 760 350 S 1120 300, 1510 390" fill="none" stroke="#d4c7aa" stroke-width="1.0" />
    <path d="M 90 600 C 300 560, 500 640, 780 590 S 1120 540, 1490 630" fill="none" stroke="#d4c7aa" stroke-width="0.9" />
  </g>

  <g>${forests.join("\n")}</g>
  <g>${waters.join("\n")}</g>
  <g>${roads.join("\n")}</g>
  <g>${waterways.join("\n")}</g>
  <g>${waterLabels.slice(0, 3).join("\n")}</g>

  <path d="${routePath}" fill="none" stroke="#faf5e9" stroke-width="7.4" stroke-linecap="round" stroke-linejoin="round" opacity="0.95" />
  <path d="${routePath}" fill="none" stroke="#10161d" stroke-width="4.35" stroke-linecap="round" stroke-linejoin="round" opacity="0.97" />
  <path d="${routePath}" fill="none" stroke="#ff6330" stroke-width="2.05" stroke-linecap="round" stroke-linejoin="round" />

  <g>${placeLabels.join("\n")}</g>
  <g>${kmMarkers.join("\n")}</g>

  <circle cx="${start[0]}" cy="${start[1]}" r="9" fill="#6ea45a" stroke="#10161d" stroke-width="2" />
  <circle cx="${end[0]}" cy="${end[1]}" r="9" fill="#d84a3a" stroke="#10161d" stroke-width="2" />

  <g>
    <line x1="80" y1="${HEIGHT - 55}" x2="190" y2="${HEIGHT - 55}" stroke="#10161d" stroke-width="3" />
    <text x="135" y="${HEIGHT - 68}" font-family="Arial, sans-serif" font-size="15" fill="#10161d" text-anchor="middle">1 km</text>
  </g>

  <g>
    <line x1="${WIDTH - 70}" y1="125" x2="${WIDTH - 70}" y2="75" stroke="#10161d" stroke-width="2" />
    <path d="M ${WIDTH - 70} 64 L ${WIDTH - 80} 82 L ${WIDTH - 60} 82 Z" fill="#10161d" />
    <text x="${WIDTH - 70}" y="55" font-family="Arial, sans-serif" font-size="16" font-weight="700" fill="#10161d" text-anchor="middle">N</text>
  </g>
</svg>
`;
}


function formatDecimal(value: number, maximumFractionDigits: number) {
  return new Intl.NumberFormat("de-DE", {
    maximumFractionDigits,
  }).format(value);
}

function formatDistance(distanceMeters: number) {
  const kilometers = distanceMeters / 1000;

  if (kilometers >= 100) {
    return `${formatDecimal(kilometers, 0)} km`;
  }

  if (kilometers >= 10) {
    return `${formatDecimal(kilometers, 1)} km`;
  }

  return `${formatDecimal(kilometers, 2)} km`;
}

function formatElevation(elevationMeters: number) {
  return `${Math.round(elevationMeters)} m`;
}

function formatDuration(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);

  if (hours <= 0) {
    return `${minutes} Min.`;
  }

  if (minutes <= 0) {
    return `${hours} Std.`;
  }

  return `${hours} Std. ${minutes} Min.`;
}

function formatActivityDateLabel(activity: StravaActivity) {
  const rawDate = activity.start_date_local || activity.start_date;

  if (!rawDate) return "Aktivität";

  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(rawDate));
}

function getActivitySportType(activity: StravaActivity) {
  return activity.sport_type || activity.type || "Run";
}

async function writeStravaActivityMetadata(
  activityId: string,
  activity: StravaActivity,
) {
  const outputDir = path.join(process.cwd(), "data");
  const outputPath = path.join(outputDir, "strava-activities.json");

  await fs.mkdir(outputDir, { recursive: true });

  let currentData: Record<string, StravaActivityMeta> = {};

  try {
    const existingContent = await fs.readFile(outputPath, "utf8");
    currentData = JSON.parse(existingContent) as Record<string, StravaActivityMeta>;
  } catch (error) {
    currentData = {};
  }

  currentData[activityId] = {
    title: activity.name,
    sportType: getActivitySportType(activity),
    dateLabel: formatActivityDateLabel(activity),
    distance: formatDistance(activity.distance),
    elevation: formatElevation(activity.total_elevation_gain),
    duration: formatDuration(activity.moving_time),
    kudos: activity.kudos_count ?? 0,
    generatedAt: new Date().toISOString(),
    mapImage: `/images/runs/${activityId}-map.png`,
  };

  const sortedData = Object.fromEntries(
    Object.entries(currentData).sort(([firstId], [secondId]) =>
      firstId.localeCompare(secondId),
    ),
  );

  await fs.writeFile(outputPath, `${JSON.stringify(sortedData, null, 2)}\n`, "utf8");

  console.log(`Metadaten aktualisiert: ${outputPath}`);
}


async function main() {
  console.log(`Hole Strava-Daten für Aktivität ${ACTIVITY_ID}...`);

  const accessToken = await refreshStravaToken();
  const activity = await getActivity(accessToken, ACTIVITY_ID);
  const route = await getActivityRoute(accessToken, ACTIVITY_ID);

  console.log(`Aktivität: ${activity.name}`);
  console.log(`Distanz: ${(activity.distance / 1000).toFixed(2)} km`);
  console.log(`Höhenmeter: ${activity.total_elevation_gain.toFixed(0)} m`);

  const bbox = getBoundingBox(route);

  console.log("Hole OSM-Daten über Overpass...");
  const osm = await getOsmData(bbox);
  const features = overpassToFeatures(osm);

  console.log(`OSM-Features: ${features.length}`);

  const svg = renderMapSvg(activity, route, features);

  const outputDir = path.join(process.cwd(), "public", "images", "runs");
  await fs.mkdir(outputDir, { recursive: true });

  const outputPath = path.join(outputDir, `${ACTIVITY_ID}-map.png`);

  await sharp(Buffer.from(svg)).png().toFile(outputPath);
  await writeStravaActivityMetadata(ACTIVITY_ID, activity);

  console.log(`Fertig: ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
