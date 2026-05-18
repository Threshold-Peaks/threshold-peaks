import { createClient } from "@sanity/client";
import nextEnv from "@next/env";
import * as cheerio from "cheerio";
import { pathToFileURL } from "node:url";

const { loadEnvConfig } = nextEnv;

loadEnvConfig(process.cwd());

const DEFAULT_MONTHS_AHEAD = Number(process.env.FLVW_MONTHS_AHEAD || 12);
const DEFAULT_DELAY_MS = Number(process.env.FLVW_DELAY_MS || 250);

function createSanityImportClient() {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
  const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-05-18";
  const token = process.env.SANITY_API_WRITE_TOKEN;

  if (!projectId) {
    throw new Error("NEXT_PUBLIC_SANITY_PROJECT_ID fehlt in .env.local oder in Vercel.");
  }

  if (!token) {
    throw new Error("SANITY_API_WRITE_TOKEN fehlt in .env.local oder in Vercel.");
  }

  return createClient({
    projectId,
    dataset,
    apiVersion,
    token,
    useCdn: false,
  });
}

function cleanText(value) {
  return String(value || "")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function slugify(value) {
  return cleanText(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96);
}

function toIsoDate(germanDate) {
  const match = cleanText(germanDate).match(/(\d{2})\.(\d{2})\.(\d{4})/);

  if (!match) {
    return null;
  }

  const [, day, month, year] = match;
  return `${year}-${month}-${day}`;
}

function getMonthPairs(monthsAhead = 12) {
  const result = [];
  const now = new Date();

  for (let i = 0; i <= monthsAhead; i += 1) {
    const date = new Date(now.getFullYear(), now.getMonth() + i, 1);

    result.push({
      year: date.getFullYear(),
      month: date.getMonth() + 1,
    });
  }

  return result;
}

function unique(values) {
  return [...new Set(values.filter(Boolean).map(cleanText))];
}

function formatDistanceNumber(value, maximumFractionDigits = 3) {
  if (!Number.isFinite(value)) return "";

  return new Intl.NumberFormat("de-DE", {
    maximumFractionDigits,
  }).format(value);
}

function normalizeDistanceLabel(value) {
  const rawValue = cleanText(value);
  const match = rawValue.match(/(\d+(?:[,.]\d+)?)\s*(km|m)\b/i);

  if (!match) return rawValue;

  const numericValue = Number(match[1].replace(",", "."));
  const unit = match[2].toLowerCase();

  if (!Number.isFinite(numericValue)) return rawValue;

  if (unit === "km") {
    // Kleine Dezimal-km lesbarer als Meter anzeigen:
    // 0,85 km -> 850 m, 0,6 km -> 600 m.
    if (numericValue > 0 && numericValue < 1) {
      return `${formatDistanceNumber(Math.round(numericValue * 1000), 0)} m`;
    }

    // FLVW-Datenfehler abfangen: Werte wie 7250 km sind praktisch
    // immer als 7250 m gemeint. Echte Ultras bis unter 400 km bleiben km.
    if (numericValue >= 400) {
      if (numericValue < 1000) {
        return `${formatDistanceNumber(Math.round(numericValue), 0)} m`;
      }

      return `${formatDistanceNumber(numericValue / 1000)} km`;
    }

    return `${formatDistanceNumber(numericValue)} km`;
  }

  if (numericValue >= 1000) {
    return `${formatDistanceNumber(numericValue / 1000)} km`;
  }

  return `${formatDistanceNumber(Math.round(numericValue), 0)} m`;
}


function normalizeDistanceText(value) {
  return cleanText(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function getDistanceKmValueFromLabel(label) {
  const normalizedLabel = normalizeDistanceText(label).replace(/,/g, ".");

  if (normalizedLabel.includes("halbmarathon")) {
    return 21.098;
  }

  if (/\bmarathon\b/.test(normalizedLabel)) {
    return 42.195;
  }

  const match = normalizedLabel.match(/(\d+(?:\.\d+)?)\s*(km|m)\b/);

  if (!match) return null;

  const numericValue = Number(match[1]);
  const unit = match[2];

  if (!Number.isFinite(numericValue)) return null;

  return unit === "m" ? numericValue / 1000 : numericValue;
}

function hasDistanceNear(distances, targetKm, toleranceKm = 0.25) {
  return distances.some((distance) => {
    const kmValue = getDistanceKmValueFromLabel(distance);

    return kmValue !== null && Math.abs(kmValue - targetKm) <= toleranceKm;
  });
}

function addNamedDistanceFallbacks(distances, competitionText) {
  const normalizedCompetitionText = normalizeDistanceText(competitionText);
  const result = [...distances];

  // Manche FLVW-Seiten führen die Strecke im Laufnamen sauber als
  // "Halbmarathon", aber die numerische Streckenlänge wird im HTML nicht
  // zuverlässig von unserer km/m-Erkennung erwischt. Dann ergänzen wir die
  // geläufige Bezeichnung als Fallback.
  if (
    normalizedCompetitionText.includes("halbmarathon") &&
    !result.some((distance) => normalizeDistanceText(distance).includes("halbmarathon")) &&
    !hasDistanceNear(result, 21.098)
  ) {
    result.unshift("Halbmarathon");
  }

  const textWithoutHalfMarathon = normalizedCompetitionText.replace(/halbmarathon/g, "");

  if (
    /\bmarathon\b/.test(textWithoutHalfMarathon) &&
    !result.some((distance) => /^marathon$/i.test(cleanText(distance))) &&
    !hasDistanceNear(result, 42.195)
  ) {
    result.unshift("Marathon");
  }

  return unique(result);
}

async function fetchHtml(url) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "ThresholdPeaksBot/1.0 (+https://www.threshold-peaks.de)",
      Accept: "text/html,application/xhtml+xml",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`FLVW Abruf fehlgeschlagen: ${response.status} ${url}`);
  }

  return response.text();
}


function toAbsoluteUrl(href, baseUrl) {
  if (!href) return "";

  try {
    const absoluteUrl = new URL(href, baseUrl);
    const protocol = absoluteUrl.protocol.toLowerCase();

    if (protocol !== "http:" && protocol !== "https:") {
      return "";
    }

    return absoluteUrl.toString();
  } catch {
    return "";
  }
}

function getPageLinks($, baseUrl) {
  return $("a")
    .toArray()
    .map((element) => {
      const text = cleanText($(element).text());
      const href = $(element).attr("href") || "";

      return {
        text,
        href,
        url: toAbsoluteUrl(href, baseUrl),
      };
    })
    .filter((link) => link.href || link.url || link.text);
}


function getElementTextWithValues($, element) {
  const root = $(element);
  const formValues = root
    .find("input, textarea, option")
    .toArray()
    .map((inputElement) => {
      const input = $(inputElement);

      return input.attr("value") || input.text() || "";
    });

  return cleanText([root.text(), ...formValues].join(" "));
}

function extractDistanceLabelsFromText(value) {
  const text = cleanText(value);

  return [
    ...(text.match(/\b\d+(?:[,.]\d+)?\s*km\b/gi) || []),
    // Meterangaben bewusst nur klein geschrieben erkennen, damit Altersklassen
    // wie "M50" nicht versehentlich als 50 m interpretiert werden.
    ...(text.match(/\b\d+(?:[,.]\d+)?\s*m\b/g) || []),
  ];
}

function getCompetitionTextSources($, competitionText) {
  const tableTexts = $("table")
    .toArray()
    .map((table) => getElementTextWithValues($, table))
    .filter((tableText) => {
      const normalizedTableText = normalizeDistanceText(tableText);

      return (
        normalizedTableText.includes("laufname") ||
        normalizedTableText.includes("streckenlange") ||
        normalizedTableText.includes("streckenlaenge") ||
        normalizedTableText.includes("ausgeschriebene altersklassen")
      );
    });

  return unique([
    competitionText,
    ...tableTexts,
  ]);
}

function isCalendarFileLink(link) {
  const text = link.text.toLowerCase();
  const href = String(link.href || "").toLowerCase();
  const url = String(link.url || "").toLowerCase();

  return (
    text.includes("kalender-datei") ||
    text.includes("vcal") ||
    text.includes("ical") ||
    text.includes("ics") ||
    href.includes("vcal") ||
    href.includes("ical") ||
    href.includes(".ics") ||
    url.includes("vcal") ||
    url.includes("ical") ||
    url.includes(".ics")
  );
}

async function getMonthlyEventLinks(year, month) {
  const url = `https://www.flvwdialog.de/php/db/index.php?jahr=${year}&monat=${month}&muster=00100`;
  const html = await fetchHtml(url);
  const $ = cheerio.load(html);
  const links = [];

  $("a").each((_, element) => {
    const href = $(element).attr("href");
    const title = cleanText($(element).text());

    if (!href || !title) {
      return;
    }

    const absoluteUrl = new URL(href, url);

    if (!absoluteUrl.pathname.endsWith("/info.php")) {
      return;
    }

    const sourceId = absoluteUrl.searchParams.get("id");

    if (!sourceId) {
      return;
    }

    links.push({
      title,
      sourceId,
      sourceUrl: absoluteUrl.toString(),
    });
  });

  return links;
}

function extractPostalCode(value) {
  const match = cleanText(value).match(/\b(\d{5})\b/);
  return match?.[1] || "";
}

function escapeRegex(value) {
  return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractDetailData(html, fallback) {
  const $ = cheerio.load(html);
  const pageLinks = getPageLinks($, fallback.sourceUrl);

  const rawBodyText = $("body").text();
  const bodyText = cleanText(rawBodyText);

  const lines = rawBodyText
    .split("\n")
    .map(cleanText)
    .filter(Boolean)
    .filter((line) => line !== "* * *");

  const titleFromPageTitle = cleanText($("title").first().text()).replace(
    /^FLVW Veranstaltungsinformation:\s*/i,
    ""
  );

  const detailIndex = lines.findIndex((line) =>
    line.toLowerCase().includes("detailinformationen")
  );

  const titleFromLines =
    detailIndex >= 0 && lines[detailIndex + 1]
      ? lines[detailIndex + 1]
      : "";

  const title = cleanText(titleFromPageTitle || titleFromLines || fallback.title);

  const titlePosition = bodyText.indexOf(title);
  const ausrichterPosition = bodyText.indexOf(
    "Ausrichter:",
    titlePosition >= 0 ? titlePosition : 0
  );

  let headerText = "";

  if (titlePosition >= 0 && ausrichterPosition > titlePosition) {
    headerText = bodyText.slice(titlePosition + title.length, ausrichterPosition);
  } else if (ausrichterPosition > 0) {
    headerText = bodyText.slice(0, ausrichterPosition);
  } else {
    headerText = bodyText;
  }

  headerText = cleanText(headerText);

  const dateRegex =
    /\b(\d{5})\b\s+([A-Za-zÄÖÜäöüß .\-\/()]+?)\s+(\d{2}\.\d{2}\.\d{4})(?:\s*-\s*(\d{2}\.\d{2}\.\d{4}))?/i;

  let dateMatch = headerText.match(dateRegex);

  if (!dateMatch) {
    dateMatch = bodyText.match(dateRegex);
  }

  const postalCode = dateMatch?.[1] || "";
  const city = cleanText(dateMatch?.[2] || "");
  const germanDate = dateMatch?.[3] || "";
  const date = germanDate ? toIsoDate(germanDate) : null;

  let location = "";

  if (dateMatch && typeof dateMatch.index === "number") {
    const sourceText = dateMatch.input || headerText;
    location = cleanText(sourceText.slice(0, dateMatch.index));
  }

  location = location
    .replace(/DETAILINFORMATIONEN\s*Stand:\s*\d{2}\.\d{2}\.\d{4}\s*-\s*\d{1,2}:\d{2}\s*Uhr/gi, "")
    .replace(title, "")
    .replace(/\* \* \*/g, "")
    .replace(/\bMontag\b/gi, "")
    .replace(/\bDienstag\b/gi, "")
    .replace(/\bMittwoch\b/gi, "")
    .replace(/\bDonnerstag\b/gi, "")
    .replace(/\bFreitag\b/gi, "")
    .replace(/\bSamstag\b/gi, "")
    .replace(/\bSonntag\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  const time =
    headerText.match(/\b\d{1,2}:\d{2}\s*Uhr\b/i)?.[0] ||
    bodyText.match(/\b\d{1,2}:\d{2}\s*Uhr\b/i)?.[0] ||
    "";

  const organizerIndex = lines.findIndex((line) => line === "Ausrichter:");

  const organizerRaw =
    organizerIndex >= 0 && lines[organizerIndex + 1]
      ? lines[organizerIndex + 1]
      : bodyText.match(/Ausrichter:\s*(.+?)\s+DLV-Veranstaltungsnummer:/i)?.[1] ||
        "";

  const organizer = cleanText(organizerRaw)
    .replace(/\s*Kalender-Datei\s+laden\s*\(vCal\)\s*/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  const dlvNumber =
    bodyText.match(/DLV-Veranstaltungsnummer:\s*([A-Z0-9]+)/i)?.[1] || "";

  const flvwNumber =
    bodyText.match(/FLVW-Veranstaltungsnummer:\s*([0-9]+)/i)?.[1] ||
    fallback.sourceId;

  const districtLine = lines.find((line) => line.startsWith("FLVW Kreis "));

  const district = districtLine
    ? cleanText(districtLine.replace("FLVW Kreis", "").replace(/\(.+?\)/g, ""))
    : cleanText(bodyText.match(/FLVW Kreis\s+(.+?)\s+\(/i)?.[1] || "");

  const category =
    bodyText.match(/Veranstaltungskategorie:\s*(.+?)\s+Automatisiert/i)?.[1] ||
    bodyText.match(/Veranstaltungskategorie:\s*(.+?)\s+Genehmigung/i)?.[1] ||
    "";

  const calendarUrl =
    pageLinks.find((link) => isCalendarFileLink(link))?.url || "";

  const website =
    pageLinks.find((link) => {
      if (!link.url) {
        return false;
      }

      const url = link.url.toLowerCase();
      const text = link.text.toLowerCase();

      return (
        (text.includes("internetseite") || text.includes("www")) &&
        !url.includes("flvw.de") &&
        !url.includes("flvwdialog.de") &&
        !url.includes("openstreetmap")
      );
    })?.url || "";

  const competitionStart = bodyText.indexOf(
    "Ausgeschriebene Altersklassen"
  );

  const competitionEnd = bodyText.indexOf("Parallel-Veranstaltungen");

  const competitionText =
    competitionStart >= 0
      ? bodyText.slice(
          competitionStart,
          competitionEnd > competitionStart ? competitionEnd : undefined
        )
      : "";

  const competitionTextSources = getCompetitionTextSources($, competitionText);
  const combinedCompetitionText = cleanText(competitionTextSources.join(" "));
  const rawDistances = competitionTextSources.flatMap(extractDistanceLabelsFromText);

  const distances = addNamedDistanceFallbacks(
    unique(rawDistances.map(normalizeDistanceLabel)),
    combinedCompetitionText,
  );

  return {
    title,
    date,
    time: cleanText(time),
    location: cleanText(location),
    postalCode,
    city,
    region: cleanText(district),
    district: cleanText(district),
    organizer: cleanText(organizer),
    category: cleanText(category),
    distances,
    externalUrl: website,
    calendarUrl,
    sourceName: "FLVW Laufkalender",
    sourceUrl: fallback.sourceUrl,
    sourceId: fallback.sourceId,
    dlvNumber,
    flvwNumber,
    bodyText,
  };
}

async function getEventDetails(link) {
  const html = await fetchHtml(link.sourceUrl);
  return extractDetailData(html, link);
}

function buildSanityDocument(event) {
  const now = new Date().toISOString();
  const id = `importedFlvwEvent-flvw-${event.sourceId}`;
  const slug = slugify(`${event.date || "lauf"}-${event.title}`);

  return {
    _id: id,
    _type: "importedFlvwEvent",

    title: event.title,
    slug: {
      _type: "slug",
      current: slug,
    },

    date: event.date,
    time: event.time || undefined,
    location: event.location || undefined,
    postalCode: event.postalCode || undefined,
    city: event.city || undefined,
    region: event.region || undefined,
    district: event.district || undefined,
    organizer: event.organizer || undefined,
    category: event.category || undefined,
    distances: event.distances || [],

    externalUrl: event.externalUrl || undefined,
    calendarUrl: event.calendarUrl || undefined,

    sourceName: "FLVW Laufkalender",
    sourceUrl: event.sourceUrl,
    sourceId: event.sourceId,
    dlvNumber: event.dlvNumber || undefined,
    flvwNumber: event.flvwNumber || undefined,

    hidden: false,
    featured: false,
    status: "ungeprueft",
    notes: "",
    needsGeoCheck: true,

    importedAt: now,
    lastSyncedAt: now,
  };
}

export async function runFlvwImport(options = {}) {
  const {
    dryRun = false,
    monthsAhead = DEFAULT_MONTHS_AHEAD,
    delayMs = DEFAULT_DELAY_MS,
    log = console.log,
    warn = console.warn,
  } = options;

  const client = dryRun ? null : createSanityImportClient();
  const monthPairs = getMonthPairs(monthsAhead);
  const linkMap = new Map();

  for (const { year, month } of monthPairs) {
    log(`Lese FLVW Monat ${month}/${year} ...`);

    const links = await getMonthlyEventLinks(year, month);

    for (const link of links) {
      linkMap.set(link.sourceId, link);
    }
  }

  const links = [...linkMap.values()];
  log(`${links.length} FLVW-Links gefunden.`);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const imported = [];
  const skipped = [];
  const errors = [];

  for (const link of links) {
    try {
      const event = await getEventDetails(link);

      if (!event.date) {
        skipped.push(`${link.title} · kein Datum`);
        continue;
      }

      const eventDate = new Date(`${event.date}T00:00:00`);

      if (eventDate < today) {
        skipped.push(`${event.title} · Vergangenheit`);
        continue;
      }

      const doc = buildSanityDocument(event);

      imported.push(doc);

      if (dryRun) {
        log(
          `[DRY] ${doc.date} · ${doc.title} · ${doc.city || ""} · ${doc._id}`
        );
      } else {
        const syncData = {
          title: doc.title,
          slug: doc.slug,
          date: doc.date,
          time: doc.time,
          location: doc.location,
          postalCode: doc.postalCode,
          city: doc.city,
          region: doc.region,
          district: doc.district,
          organizer: doc.organizer,
          category: doc.category,
          distances: doc.distances,
          externalUrl: doc.externalUrl,
          calendarUrl: doc.calendarUrl,
          sourceName: doc.sourceName,
          sourceUrl: doc.sourceUrl,
          sourceId: doc.sourceId,
          dlvNumber: doc.dlvNumber,
          flvwNumber: doc.flvwNumber,
          lastSyncedAt: doc.lastSyncedAt,
        };

        await client
          .transaction()
          .createIfNotExists(doc)
          .patch(doc._id, (patch) =>
            patch
              .set(syncData)
              .setIfMissing({
                hidden: false,
                featured: false,
                status: "ungeprueft",
                notes: "",
                needsGeoCheck: true,
                importedAt: doc.importedAt,
              }),
          )
          .commit();

        log(
          `[OK] ${doc.date} · ${doc.title} · ${doc.city || ""} · ${doc._id}`
        );
      }

      if (delayMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const entry = `${link.title}: ${message}`;

      errors.push(entry);
      warn(`[FEHLER] ${entry}`);
    }
  }

  log("");
  log(
    `${imported.length} Events ${
      dryRun ? "würden importiert" : "importiert"
    }.`
  );
  log(`${skipped.length} Events übersprungen.`);

  if (errors.length > 0) {
    log(`${errors.length} Events mit Fehler.`);
  }

  if (skipped.length > 0) {
    log("");
    log("Erste übersprungene Events:");
    skipped.slice(0, 20).forEach((entry) => {
      log(`- ${entry}`);
    });
  }

  return {
    dryRun,
    monthsAhead,
    foundCount: links.length,
    importedCount: imported.length,
    skippedCount: skipped.length,
    errorCount: errors.length,
    skipped: skipped.slice(0, 20),
    errors: errors.slice(0, 20),
  };
}

function isCliRun() {
  return Boolean(
    process.argv[1] &&
      import.meta.url === pathToFileURL(process.argv[1]).href
  );
}

if (isCliRun()) {
  runFlvwImport({
    dryRun: process.argv.includes("--dry-run"),
  }).catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
