import { createClient } from "@sanity/client";
import { loadEnvConfig } from "@next/env";
import * as cheerio from "cheerio";
import { pathToFileURL } from "node:url";

loadEnvConfig(process.cwd());

type FlvwEventLink = {
  title: string;
  sourceId: string;
  sourceUrl: string;
  overviewDate: string;
  overviewCity: string;
  overviewText: string;
};

type FlvwEvent = {
  title: string;
  date: string;
  time: string;
  location: string;
  postalCode: string;
  city: string;
  region: string;
  district: string;
  organizer: string;
  category: string;
  distances: string[];
  externalUrl: string;
  calendarUrl: string;
  sourceName: "FLVW Laufkalender";
  sourceUrl: string;
  sourceId: string;
  dlvNumber: string;
  flvwNumber: string;
};

type SanityEvent = {
  _id: string;
  _type: string;
  title?: string;
  slug?: {
    current?: string;
  };
  date?: string;
  time?: string;
  location?: string;
  postalCode?: string;
  city?: string;
  region?: string;
  district?: string;
  organizer?: string;
  category?: string;
  distances?: string[];
  externalUrl?: string;
  calendarUrl?: string;
  sourceName?: string;
  sourceUrl?: string;
  sourceId?: string;
  dlvNumber?: string;
  flvwNumber?: string;
  status?: string;
  hidden?: boolean;
  lastSyncedAt?: string;
};

type ChangedField = {
  field: keyof FlvwEvent;
  before: string | string[] | undefined;
  after: string | string[];
};

type ChangedEvent = {
  source: FlvwEvent;
  sanity: SanityEvent;
  changes: ChangedField[];
};

type MatchCandidate = {
  sanity: SanityEvent;
  score: number;
  reasons: string[];
};

type UncertainMatch = {
  source: FlvwEvent;
  candidates: MatchCandidate[];
};

type CheckReport = {
  generatedAt: string;
  today: string;
  scanEnd: string;
  monthsAhead: number;
  flvwCount: number;
  flvwSeenCount: number;
  sanityCount: number;
  newEvents: FlvwEvent[];
  changedEvents: ChangedEvent[];
  possiblyRemovedEvents: SanityEvent[];
  uncertainMatches: UncertainMatch[];
  skipped: string[];
  errors: string[];
};

type RunMode = "check" | "classify" | "safe-apply";

type CheckOptions = {
  monthsAhead: number;
  delayMs: number;
  json: boolean;
  mode: RunMode;
  limit?: number;
};

type ClassifiedChangedEvent = {
  sourceId: string;
  date: string;
  title: string;
  city: string;
  sanityId: string;
  group: "normalization" | "addition" | "critical";
  before: string[];
  after: string[];
  added: string[];
  removed: string[];
  suspicious: string[];
  fields: Array<keyof FlvwEvent>;
  source: FlvwEvent;
  sanity: SanityEvent;
};

type ClassifiedReport = {
  generatedAt: string;
  summary: {
    newCount: number;
    changedCount: number;
    normalizationCount: number;
    additionCount: number;
    criticalCount: number;
    removedCount: number;
    uncertainCount: number;
    errorCount: number;
    timeOnlyChanged: number;
    changesWithTime: number;
  };
  normalization: ClassifiedChangedEvent[];
  addition: ClassifiedChangedEvent[];
  critical: ClassifiedChangedEvent[];
  newEvents: FlvwEvent[];
  possiblyRemovedEvents: SanityEvent[];
  uncertainMatches: UncertainMatch[];
  errors: string[];
};

type SafeApplyResult = {
  mutationCommitted: boolean;
  createCount: number;
  updateCount: number;
  deleteCount: number;
  excludedCriticalCount: number;
  skippedNewCount: number;
  control: {
    createCount: number;
    updateCount: number;
    deleteCount: number;
    remainingChangedCount: number;
    remainingCriticalCount: number;
    errorCount: number;
    uncertainCount: number;
    removedCount: number;
    timeOnlyChanged: number;
    changesWithTime: number;
  };
};

const DEFAULT_MONTHS_AHEAD = getNumberEnv("FLVW_CHECK_MONTHS_AHEAD", 12);
const DEFAULT_DELAY_MS = getNumberEnv(
  "FLVW_CHECK_DELAY_MS",
  getNumberEnv("FLVW_DELAY_MS", 250),
);

const COMPARED_FIELDS: Array<keyof FlvwEvent> = [
  "title",
  "date",
  "time",
  "location",
  "postalCode",
  "city",
  "region",
  "district",
  "organizer",
  "category",
  "distances",
  "externalUrl",
  "calendarUrl",
  "sourceUrl",
  "dlvNumber",
  "flvwNumber",
];

const REQUIRED_COMPARE_FIELDS = new Set<keyof FlvwEvent>([
  "title",
  "date",
  "sourceId",
  "sourceUrl",
]);

function getNumberEnv(name: string, fallback: number) {
  const value = Number(process.env[name]);

  return Number.isFinite(value) ? value : fallback;
}

function getStringEnv(name: string, fallback: string) {
  const value = cleanText(process.env[name]);

  return value || fallback;
}

function cleanText(value: unknown) {
  return String(value ?? "")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeText(value: unknown) {
  return cleanText(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ae/g, "a")
    .replace(/oe/g, "o")
    .replace(/ue/g, "u")
    .replace(/ss/g, "s")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeComparableValue(value: unknown) {
  return normalizeText(value).replace(/\/$/, "");
}

function toIsoDate(germanDate: string) {
  const match = cleanText(germanDate).match(/(\d{2})\.(\d{2})\.(\d{4})/);

  if (!match) return "";

  const [, day, month, year] = match;
  return `${year}-${month}-${day}`;
}

function toIsoDateFromDay(year: number, month: number, day: string) {
  const dayNumber = Number(day);

  if (!Number.isInteger(dayNumber) || dayNumber < 1 || dayNumber > 31) {
    return "";
  }

  return `${year}-${String(month).padStart(2, "0")}-${String(dayNumber).padStart(
    2,
    "0",
  )}`;
}

function getBerlinDateParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Berlin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const getPart = (type: string) =>
    Number(parts.find((part) => part.type === type)?.value);

  return {
    year: getPart("year"),
    month: getPart("month"),
    day: getPart("day"),
  };
}

function getTodayKey() {
  const { year, month, day } = getBerlinDateParts();

  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(
    2,
    "0",
  )}`;
}

function getMonthPairs(monthsAhead: number) {
  const { year, month } = getBerlinDateParts();
  const result: Array<{ year: number; month: number }> = [];

  for (let index = 0; index <= monthsAhead; index += 1) {
    const date = new Date(year, month - 1 + index, 1);

    result.push({
      year: date.getFullYear(),
      month: date.getMonth() + 1,
    });
  }

  return result;
}

function getScanEnd(monthPairs: Array<{ year: number; month: number }>) {
  const lastPair = monthPairs[monthPairs.length - 1];
  const endDate = new Date(lastPair.year, lastPair.month, 0);

  return `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(
    2,
    "0",
  )}-${String(endDate.getDate()).padStart(2, "0")}`;
}

function unique(values: string[]) {
  return [...new Set(values.map(cleanText).filter(Boolean))];
}

function formatDistanceNumber(value: number, maximumFractionDigits = 3) {
  if (!Number.isFinite(value)) return "";

  return new Intl.NumberFormat("de-DE", {
    maximumFractionDigits,
  }).format(value);
}

function normalizeDistanceLabel(value: string) {
  const rawValue = cleanText(value);
  const match = rawValue.match(/(\d+(?:[,.]\d+)?)\s*(km|m)\b/i);

  if (!match) return rawValue;

  const numericValue = Number(match[1].replace(",", "."));
  const unit = match[2].toLowerCase();

  if (!Number.isFinite(numericValue)) return rawValue;

  if (unit === "km") {
    if (numericValue > 0 && numericValue < 1) {
      return `${formatDistanceNumber(Math.round(numericValue * 1000), 0)} m`;
    }

    if (Math.abs(numericValue - 21.098) < 0.02 || Math.abs(numericValue - 21.1) < 0.02) {
      return "Halbmarathon";
    }

    if (Math.abs(numericValue - 42.195) < 0.02 || Math.abs(numericValue - 42.2) < 0.02) {
      return "Marathon";
    }

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

function getDistanceKmValueFromLabel(label: string) {
  const normalizedLabel = cleanText(label).toLowerCase().replace(/,/g, ".");

  if (normalizedLabel.includes("halbmarathon")) return 21.098;
  if (/\bmarathon\b/.test(normalizedLabel)) return 42.195;

  const match = normalizedLabel.match(/(\d+(?:\.\d+)?)\s*(km|m)\b/);

  if (!match) return null;

  const numericValue = Number(match[1]);

  if (!Number.isFinite(numericValue)) return null;

  return match[2] === "m" ? numericValue / 1000 : numericValue;
}

function hasDistanceNear(distances: string[], targetKm: number, toleranceKm = 0.25) {
  return distances.some((distance) => {
    const kmValue = getDistanceKmValueFromLabel(distance);

    return kmValue !== null && Math.abs(kmValue - targetKm) <= toleranceKm;
  });
}

function addNamedDistanceFallbacks(distances: string[], competitionText: string) {
  const normalizedCompetitionText = normalizeText(competitionText);
  const result = [...distances];

  if (
    normalizedCompetitionText.includes("halbmarathon") &&
    !result.some((distance) => normalizeText(distance).includes("halbmarathon")) &&
    !hasDistanceNear(result, 21.098)
  ) {
    result.unshift("Halbmarathon");
  }

  const textWithoutHalfMarathon = normalizedCompetitionText.replace(
    /halbmarathon/g,
    "",
  );

  if (
    /\bmarathon\b/.test(textWithoutHalfMarathon) &&
    !result.some((distance) => /^marathon$/i.test(cleanText(distance))) &&
    !hasDistanceNear(result, 42.195)
  ) {
    result.unshift("Marathon");
  }

  return unique(result);
}

function extractDistanceLabelsFromText(value: string) {
  const text = cleanText(value);

  return [
    ...(text.match(/\b\d+(?:[,.]\d+)?\s*km(?![\p{L}])/giu) || []),
    ...(text.match(/\b\d+(?:[,.]\d+)?\s*m(?:eter)?(?![\p{L}])/giu) || []),
  ].filter(isPlausibleDistanceLabel);
}

function isPlausibleDistanceLabel(value: string) {
  const match = cleanText(value).match(/(\d+(?:[,.]\d+)?)\s*(km|m)\b/i);

  if (!match) return false;

  const numericValue = Number(match[1].replace(",", "."));
  const unit = match[2].toLowerCase();

  if (!Number.isFinite(numericValue) || numericValue <= 0) return false;
  if (unit === "m") return numericValue <= 5000;

  return numericValue <= 200;
}

function isDistanceColumnHeader(value: string) {
  const normalizedValue = normalizeText(value);

  return (
    normalizedValue.includes("streckenlange") ||
    normalizedValue.includes("streckenlaenge") ||
    normalizedValue === "strecke" ||
    normalizedValue === "distanz"
  );
}

function isCompetitionNameColumnHeader(value: string) {
  const normalizedValue = normalizeText(value);

  return (
    normalizedValue.includes("laufname") ||
    normalizedValue.includes("wettbewerb") ||
    normalizedValue.includes("disziplin")
  );
}

function getCompetitionTableDistanceLabels($: cheerio.CheerioAPI) {
  const labels: string[] = [];

  $("table").each((_, table) => {
    const rows = $(table)
      .find("tr")
      .toArray()
      .map((row) =>
        $(row)
          .find("td, th")
          .toArray()
          .map((cell) => cleanText($(cell).text()))
          .filter(Boolean),
      )
      .filter((row) => row.length > 0);

    const headerIndex = rows.findIndex(
      (row) =>
        row.some(isCompetitionNameColumnHeader) && row.some(isDistanceColumnHeader),
    );

    if (headerIndex < 0) return;

    const headers = rows[headerIndex];
    const distanceColumnIndexes = headers
      .map((header, index) => (isDistanceColumnHeader(header) ? index : -1))
      .filter((index) => index >= 0);
    const nameColumnIndexes = headers
      .map((header, index) => (isCompetitionNameColumnHeader(header) ? index : -1))
      .filter((index) => index >= 0);
    const targetColumnIndexes = unique(
      [...nameColumnIndexes, ...distanceColumnIndexes].map(String),
    ).map(Number);

    for (const row of rows.slice(headerIndex + 1)) {
      for (const index of targetColumnIndexes) {
        const cellText = row[index];

        if (!cellText) continue;

        labels.push(...extractDistanceLabelsFromText(cellText));
      }
    }
  });

  return labels;
}

async function fetchHtml(url: string) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "ThresholdPeaksUpdateCheck/1.0 (+https://www.threshold-peaks.de)",
      Accept: "text/html,application/xhtml+xml",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`FLVW fetch failed: ${response.status} ${url}`);
  }

  return response.text();
}

function toAbsoluteUrl(href: string | undefined, baseUrl: string) {
  if (!href) return "";

  try {
    const absoluteUrl = new URL(href, baseUrl);
    const protocol = absoluteUrl.protocol.toLowerCase();

    if (protocol !== "http:" && protocol !== "https:") return "";

    return absoluteUrl.toString();
  } catch {
    return "";
  }
}

function getPageLinks($: cheerio.CheerioAPI, baseUrl: string) {
  return $("a")
    .toArray()
    .map((element) => {
      const link = $(element);
      const text = cleanText(link.text());
      const href = link.attr("href") || "";

      return {
        text,
        href,
        url: toAbsoluteUrl(href, baseUrl),
      };
    })
    .filter((link) => link.href || link.url || link.text);
}

function textHasMetaTimeContext(value: string) {
  const normalized = normalizeText(value);

  return [
    "stand",
    "datenstand",
    "letzter abgleich",
    "letzte anderung",
    "letzte aenderung",
    "aktualisiert",
    "importiert",
    "genehmigung",
    "meldeschluss",
    "dialog version",
  ].some((marker) => normalized.includes(marker));
}

function extractStartTimeFromText(value: string) {
  const text = cleanText(value);

  if (!text || textHasMetaTimeContext(text)) return "";

  const labelMatch = text.match(
    /\b(?:start(?:zeit)?|beginn|veranstaltungsbeginn|erster\s+start|hauptlauf)\b\s*:?\s*(\d{1,2}:\d{2})\s*Uhr/i,
  );

  if (labelMatch?.[1]) {
    return `${labelMatch[1]} Uhr`;
  }

  return "";
}

function extractEventStartTime(lines: string[]) {
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const directTime = extractStartTimeFromText(line);

    if (directTime) return directTime;

    const normalizedLine = normalizeText(line);

    if (
      /\b(start(?:zeit)?|beginn|veranstaltungsbeginn|erster start|hauptlauf)\b/.test(
        normalizedLine,
      ) &&
      !textHasMetaTimeContext(line)
    ) {
      const nextLine = lines[index + 1] || "";
      const nextLineMatch = cleanText(nextLine).match(/^(\d{1,2}:\d{2})\s*Uhr$/i);

      if (nextLineMatch?.[1]) {
        return `${nextLineMatch[1]} Uhr`;
      }
    }
  }

  return "";
}

function extractOverviewDate(
  $: cheerio.CheerioAPI,
  element: Parameters<cheerio.CheerioAPI>[0],
  year: number,
  month: number,
) {
  const cellText = cleanText($(element).closest("td").text());
  const dayMatch = cellText.match(/^(\d{1,2})\b/);

  return dayMatch ? toIsoDateFromDay(year, month, dayMatch[1]) : "";
}

function extractOverviewCity(
  $: cheerio.CheerioAPI,
  element: Parameters<cheerio.CheerioAPI>[0],
) {
  const cellText = cleanText($(element).closest("td").text());
  const title = cleanText($(element).text());
  const titlePosition = cellText.indexOf(title);
  const beforeTitle = titlePosition >= 0 ? cellText.slice(0, titlePosition) : "";
  const cityMatch = cleanText(beforeTitle)
    .replace(/^\d{1,2}\s*/, "")
    .match(/([^]+?)\s*\(WE\)\s*$/);

  return cleanText(cityMatch?.[1] || "");
}

function isCalendarFileLink(link: { text: string; href: string; url: string }) {
  const text = link.text.toLowerCase();
  const href = link.href.toLowerCase();
  const url = link.url.toLowerCase();

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

function getCompetitionTextSources($: cheerio.CheerioAPI, competitionText: string) {
  const tableTexts = $("table")
    .toArray()
    .map((table) => cleanText($(table).text()))
    .filter((tableText) => {
      const normalizedTableText = normalizeText(tableText);

      return (
        normalizedTableText.includes("laufname") ||
        normalizedTableText.includes("streckenlange") ||
        normalizedTableText.includes("streckenlaenge") ||
        normalizedTableText.includes("ausgeschriebene altersklassen")
      );
    });

  return unique([competitionText, ...tableTexts]);
}

async function getMonthlyEventLinks(year: number, month: number) {
  const url = `https://www.flvwdialog.de/php/db/index.php?jahr=${year}&monat=${month}&muster=00100`;
  const html = await fetchHtml(url);
  const $ = cheerio.load(html);
  const links: FlvwEventLink[] = [];

  $("a").each((_, element) => {
    const href = $(element).attr("href");
    const title = cleanText($(element).text());

    if (!href || !title) return;

    const absoluteUrl = new URL(href, url);

    if (!absoluteUrl.pathname.endsWith("/info.php")) return;

    const sourceId = absoluteUrl.searchParams.get("id");

    if (!sourceId) return;

    links.push({
      title,
      sourceId,
      sourceUrl: absoluteUrl.toString(),
      overviewDate: extractOverviewDate($, element, year, month),
      overviewCity: extractOverviewCity($, element),
      overviewText: cleanText($(element).closest("td").text()),
    });
  });

  return links;
}

function extractDetailData(html: string, fallback: FlvwEventLink): FlvwEvent | null {
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
    "",
  );

  const detailIndex = lines.findIndex((line) =>
    line.toLowerCase().includes("detailinformationen"),
  );
  const titleFromLines =
    detailIndex >= 0 && lines[detailIndex + 1] ? lines[detailIndex + 1] : "";
  const title = cleanText(titleFromPageTitle || titleFromLines || fallback.title);
  const titlePosition = bodyText.indexOf(title);
  const organizerPosition = bodyText.indexOf(
    "Ausrichter:",
    titlePosition >= 0 ? titlePosition : 0,
  );

  let headerText = "";

  if (titlePosition >= 0 && organizerPosition > titlePosition) {
    headerText = bodyText.slice(titlePosition + title.length, organizerPosition);
  } else if (organizerPosition > 0) {
    headerText = bodyText.slice(0, organizerPosition);
  } else {
    headerText = bodyText;
  }

  const dateRegex =
    /\b(\d{5})\b\s+([A-Za-zÄÖÜäöüßA-Z .\-\/()]+?)\s+(\d{2}\.\d{2}\.\d{4})(?:\s*-\s*(\d{2}\.\d{2}\.\d{4}))?/i;
  const dateMatch = cleanText(headerText).match(dateRegex) || bodyText.match(dateRegex);

  const postalCode = dateMatch?.[1] || "";
  const city = cleanText(dateMatch?.[2] || fallback.overviewCity);
  const date = dateMatch ? toIsoDate(dateMatch[3] || "") : fallback.overviewDate;

  if (!date) {
    return null;
  }

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

  const time = extractEventStartTime(lines);
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
  const calendarUrl = pageLinks.find((link) => isCalendarFileLink(link))?.url || "";
  const externalUrl =
    pageLinks.find((link) => {
      if (!link.url) return false;

      const url = link.url.toLowerCase();
      const text = link.text.toLowerCase();

      return (
        (text.includes("internetseite") || text.includes("www")) &&
        !url.includes("flvw.de") &&
        !url.includes("flvwdialog.de") &&
        !url.includes("openstreetmap")
      );
    })?.url || "";
  const competitionStart = bodyText.indexOf("Ausgeschriebene Altersklassen");
  const competitionEnd = bodyText.indexOf("Parallel-Veranstaltungen");
  const competitionText =
    competitionStart >= 0
      ? bodyText.slice(
          competitionStart,
          competitionEnd > competitionStart ? competitionEnd : undefined,
        )
      : "";
  const competitionTextSources = getCompetitionTextSources($, competitionText);
  const combinedCompetitionText = cleanText(competitionTextSources.join(" "));
  const tableDistances = getCompetitionTableDistanceLabels($);
  const rawDistances =
    tableDistances.length > 0
      ? tableDistances
      : competitionTextSources.flatMap(extractDistanceLabelsFromText);
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
    organizer,
    category: cleanText(category),
    distances,
    externalUrl,
    calendarUrl,
    sourceName: "FLVW Laufkalender",
    sourceUrl: fallback.sourceUrl,
    sourceId: fallback.sourceId,
    dlvNumber,
    flvwNumber,
  };
}

async function getEventDetails(link: FlvwEventLink) {
  const html = await fetchHtml(link.sourceUrl);

  return extractDetailData(html, link);
}

function createSanityReadClient() {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
  const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-05-11";
  const token = process.env.SANITY_API_READ_TOKEN || process.env.SANITY_API_WRITE_TOKEN;

  if (!projectId) {
    throw new Error("NEXT_PUBLIC_SANITY_PROJECT_ID is missing.");
  }

  return createClient({
    projectId,
    dataset,
    apiVersion,
    token: token || undefined,
    useCdn: false,
  });
}

function createSanityWriteClient() {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
  const apiVersion = getStringEnv("NEXT_PUBLIC_SANITY_API_VERSION", "2026-05-11");
  const token = process.env.SANITY_API_WRITE_TOKEN;

  if (!projectId) {
    throw new Error("NEXT_PUBLIC_SANITY_PROJECT_ID is missing.");
  }

  if (!token) {
    throw new Error("SANITY_API_WRITE_TOKEN is missing.");
  }

  return createClient({
    projectId,
    dataset,
    apiVersion,
    token,
    useCdn: false,
  });
}

async function fetchExistingSanityEvents(today: string, scanEnd: string) {
  const client = createSanityReadClient();

  return client.fetch<SanityEvent[]>(
    `*[
      _type in ["importedFlvwEvent", "event", "termin"] &&
      defined(coalesce(date, startDate, eventDate)) &&
      coalesce(date, startDate, eventDate) >= $today &&
      coalesce(date, startDate, eventDate) <= $scanEnd
    ] | order(coalesce(date, startDate, eventDate) asc) {
      _id,
      _type,
      "title": coalesce(title, name),
      slug,
      "date": coalesce(date, startDate, eventDate),
      time,
      location,
      postalCode,
      city,
      region,
      district,
      organizer,
      "category": coalesce(category, eventType, type),
      distances,
      externalUrl,
      calendarUrl,
      calendarFileUrl,
      sourceName,
      sourceUrl,
      sourceId,
      dlvNumber,
      flvwNumber,
      status,
      hidden,
      lastSyncedAt
    }`,
    { today, scanEnd },
  );
}

async function fetchFlvwEvents(options: CheckOptions, today: string) {
  const linksBySourceId = new Map<string, FlvwEventLink>();
  const monthPairs = getMonthPairs(options.monthsAhead);

  for (const { year, month } of monthPairs) {
    const links = await getMonthlyEventLinks(year, month);

    for (const link of links) {
      linksBySourceId.set(link.sourceId, link);
    }
  }

  const links = [...linksBySourceId.values()].slice(0, options.limit);
  const events: FlvwEvent[] = [];
  const skipped: string[] = [];
  const errors: string[] = [];

  for (const link of links) {
    try {
      const event = await getEventDetails(link);

      if (!event) {
        skipped.push(`${link.sourceId} ${link.title}: no detail date`);
      } else if (event.date < today) {
        skipped.push(`${event.sourceId} ${event.title}: past event`);
      } else {
        events.push(event);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push(`${link.sourceId} ${link.title}: ${message}`);
    }

    if (options.delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, options.delayMs));
    }
  }

  events.sort((first, second) =>
    `${first.date} ${first.title}`.localeCompare(`${second.date} ${second.title}`),
  );

  return {
    events,
    seenSourceIds: new Set(linksBySourceId.keys()),
    skipped,
    errors,
    monthPairs,
  };
}

function normalizeArray(values: string[] | undefined) {
  return unique(values ?? [])
    .map(normalizeComparableValue)
    .sort();
}

function getSanityValue(event: SanityEvent, field: keyof FlvwEvent) {
  return event[field as keyof SanityEvent] as string | string[] | undefined;
}

function valuesAreEqual(
  field: keyof FlvwEvent,
  sourceValue: string | string[],
  sanityValue: string | string[] | undefined,
) {
  if (field === "distances") {
    return (
      JSON.stringify(normalizeArray(sourceValue as string[])) ===
      JSON.stringify(normalizeArray(sanityValue as string[] | undefined))
    );
  }

  return (
    normalizeComparableValue(sourceValue) === normalizeComparableValue(sanityValue)
  );
}

function collectChanges(source: FlvwEvent, sanity: SanityEvent) {
  const changes: ChangedField[] = [];

  for (const field of COMPARED_FIELDS) {
    const sourceValue = source[field];
    const sanityValue = getSanityValue(sanity, field);

    if (
      !REQUIRED_COMPARE_FIELDS.has(field) &&
      !Array.isArray(sourceValue) &&
      cleanText(sourceValue) === ""
    ) {
      continue;
    }

    if (
      field === "distances" &&
      Array.isArray(sourceValue) &&
      sourceValue.length === 0
    ) {
      continue;
    }

    if (!valuesAreEqual(field, sourceValue, sanityValue)) {
      changes.push({
        field,
        before: sanityValue,
        after: sourceValue,
      });
    }
  }

  return changes.every((change) => change.field === "time") ? [] : changes;
}

function getTokenSet(value: string | undefined) {
  return new Set(
    normalizeText(value)
      .split(" ")
      .filter((token) => token.length >= 3),
  );
}

function tokenSimilarity(first?: string, second?: string) {
  const firstTokens = getTokenSet(first);
  const secondTokens = getTokenSet(second);

  if (firstTokens.size === 0 || secondTokens.size === 0) return 0;

  const overlap = [...firstTokens].filter((token) => secondTokens.has(token)).length;

  return overlap / Math.max(firstTokens.size, secondTokens.size);
}

function distanceOverlap(first: string[] | undefined, second: string[] | undefined) {
  const firstValues = normalizeArray(first);
  const secondValues = normalizeArray(second);

  return firstValues.some((value) => secondValues.includes(value));
}

function scoreCandidate(source: FlvwEvent, sanity: SanityEvent): MatchCandidate {
  let score = 0;
  const reasons: string[] = [];

  if (source.date && source.date === sanity.date) {
    score += 42;
    reasons.push("same date");
  }

  if (source.city && normalizeText(source.city) === normalizeText(sanity.city)) {
    score += 18;
    reasons.push("same city");
  } else if (
    source.location &&
    sanity.location &&
    tokenSimilarity(source.location, sanity.location) >= 0.7
  ) {
    score += 12;
    reasons.push("similar location");
  }

  const titleScore = tokenSimilarity(source.title, sanity.title);

  if (titleScore >= 0.8) {
    score += 32;
    reasons.push("very similar title");
  } else if (titleScore >= 0.55) {
    score += 20;
    reasons.push("similar title");
  }

  const organizerScore = tokenSimilarity(source.organizer, sanity.organizer);

  if (organizerScore >= 0.7) {
    score += 12;
    reasons.push("similar organizer");
  }

  if (distanceOverlap(source.distances, sanity.distances)) {
    score += 8;
    reasons.push("shared distance");
  }

  return {
    sanity,
    score,
    reasons,
  };
}

function findUncertainCandidates(source: FlvwEvent, sanityEvents: SanityEvent[]) {
  return sanityEvents
    .filter((event) => event.sourceId !== source.sourceId)
    .map((event) => scoreCandidate(source, event))
    .filter((candidate) => candidate.score >= 62)
    .sort((first, second) => second.score - first.score)
    .slice(0, 3);
}

function createReport(
  flvwEvents: FlvwEvent[],
  seenSourceIds: Set<string>,
  sanityEvents: SanityEvent[],
  options: CheckOptions,
  today: string,
  scanEnd: string,
  skipped: string[],
  errors: string[],
): CheckReport {
  const sanityBySourceId = new Map(
    sanityEvents
      .filter((event) => event.sourceId)
      .map((event) => [event.sourceId as string, event]),
  );
  const newEvents: FlvwEvent[] = [];
  const changedEvents: ChangedEvent[] = [];
  const uncertainMatches: UncertainMatch[] = [];

  for (const source of flvwEvents) {
    const sanityMatch = sanityBySourceId.get(source.sourceId);

    if (sanityMatch) {
      const changes = collectChanges(source, sanityMatch);

      if (changes.length > 0) {
        changedEvents.push({
          source,
          sanity: sanityMatch,
          changes,
        });
      }

      continue;
    }

    const candidates = findUncertainCandidates(source, sanityEvents);

    if (candidates.length > 0) {
      uncertainMatches.push({
        source,
        candidates,
      });
    } else {
      newEvents.push(source);
    }
  }

  const possiblyRemovedEvents = sanityEvents.filter(
    (event) =>
      event._type === "importedFlvwEvent" &&
      event.sourceId &&
      !seenSourceIds.has(event.sourceId) &&
      event.status !== "archiv",
  );

  return {
    generatedAt: new Date().toISOString(),
    today,
    scanEnd,
    monthsAhead: options.monthsAhead,
    flvwCount: flvwEvents.length,
    flvwSeenCount: seenSourceIds.size,
    sanityCount: sanityEvents.length,
    newEvents,
    changedEvents,
    possiblyRemovedEvents,
    uncertainMatches,
    skipped,
    errors,
  };
}

function countTimeOnlyChanges(changedEvents: ChangedEvent[]) {
  return changedEvents.filter(
    (entry) =>
      entry.changes.length > 0 &&
      entry.changes.every((change) => change.field === "time"),
  ).length;
}

function countChangesWithTime(changedEvents: ChangedEvent[]) {
  return changedEvents.filter((entry) =>
    entry.changes.some((change) => change.field === "time"),
  ).length;
}

function getDistanceKey(label: string) {
  const kmValue = getDistanceKmValueFromLabel(label);

  if (kmValue !== null && Math.abs(kmValue - 21.098) <= 0.02) {
    return "half-marathon";
  }

  if (kmValue !== null && Math.abs(kmValue - 42.195) <= 0.02) {
    return "marathon";
  }

  if (kmValue !== null) {
    return `m:${Math.round((kmValue * 1000) / 10) * 10}`;
  }

  return `text:${normalizeComparableValue(label)}`;
}

function uniqueDistanceKeys(distances: string[]) {
  return unique(distances.map(getDistanceKey)).sort();
}

function hasOnlyDistanceNormalization(before: string[], after: string[]) {
  return (
    JSON.stringify(uniqueDistanceKeys(before)) ===
    JSON.stringify(uniqueDistanceKeys(after))
  );
}

function getRemovedDistances(before: string[], after: string[]) {
  const afterKeys = new Set(uniqueDistanceKeys(after));

  return before.filter((distance) => !afterKeys.has(getDistanceKey(distance)));
}

function getAddedDistances(before: string[], after: string[]) {
  const beforeKeys = new Set(uniqueDistanceKeys(before));

  return after.filter((distance) => !beforeKeys.has(getDistanceKey(distance)));
}

function isSuspiciousDistanceLabel(label: string) {
  const kmValue = getDistanceKmValueFromLabel(label);

  if (kmValue === null) return true;
  if (kmValue < 0.3) return true;
  if (kmValue > 60) return true;

  return /\b\d{5}\s*m\b/i.test(cleanText(label));
}

function toStringArray(value: string | string[] | undefined) {
  return Array.isArray(value) ? value : [];
}

function classifyChangedEvent(entry: ChangedEvent): ClassifiedChangedEvent {
  const fields = entry.changes.map((change) => change.field);
  const distanceChange = entry.changes.find((change) => change.field === "distances");
  const before = toStringArray(distanceChange?.before);
  const after = toStringArray(distanceChange?.after);
  const added = getAddedDistances(before, after);
  const removed = getRemovedDistances(before, after);
  const suspicious = added.filter(isSuspiciousDistanceLabel);
  const distancesOnly = fields.length === 1 && fields[0] === "distances";
  let group: ClassifiedChangedEvent["group"] = "critical";

  if (distancesOnly && hasOnlyDistanceNormalization(before, after)) {
    group = "normalization";
  } else if (distancesOnly && removed.length === 0 && suspicious.length === 0) {
    group = "addition";
  }

  return {
    sourceId: entry.source.sourceId,
    date: entry.source.date,
    title: entry.source.title,
    city: entry.source.city,
    sanityId: entry.sanity._id,
    group,
    before,
    after,
    added,
    removed,
    suspicious,
    fields,
    source: entry.source,
    sanity: entry.sanity,
  };
}

function classifyReport(report: CheckReport): ClassifiedReport {
  const classified = report.changedEvents.map(classifyChangedEvent);
  const normalization = classified.filter((entry) => entry.group === "normalization");
  const addition = classified.filter((entry) => entry.group === "addition");
  const critical = classified.filter((entry) => entry.group === "critical");

  return {
    generatedAt: new Date().toISOString(),
    summary: {
      newCount: report.newEvents.length,
      changedCount: report.changedEvents.length,
      normalizationCount: normalization.length,
      additionCount: addition.length,
      criticalCount: critical.length,
      removedCount: report.possiblyRemovedEvents.length,
      uncertainCount: report.uncertainMatches.length,
      errorCount: report.errors.length,
      timeOnlyChanged: countTimeOnlyChanges(report.changedEvents),
      changesWithTime: countChangesWithTime(report.changedEvents),
    },
    normalization,
    addition,
    critical,
    newEvents: report.newEvents,
    possiblyRemovedEvents: report.possiblyRemovedEvents,
    uncertainMatches: report.uncertainMatches,
    errors: report.errors,
  };
}

function valueToText(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value.join(", ");

  return cleanText(value) || "-";
}

function printEventLine(prefix: string, event: FlvwEvent | SanityEvent) {
  const sourceId = "sourceId" in event && event.sourceId ? ` #${event.sourceId}` : "";
  const city = event.city ? `, ${event.city}` : "";

  console.log(`${prefix} ${event.date || "no date"} | ${event.title || "no title"}${city}${sourceId}`);
}

function printReport(report: CheckReport) {
  console.log("Threshold Peaks FLVW Update-Check");
  console.log(`Generated: ${report.generatedAt}`);
  console.log(`Range: ${report.today} to ${report.scanEnd}`);
  console.log(`FLVW links seen: ${report.flvwSeenCount}`);
  console.log(`FLVW parsed events: ${report.flvwCount}`);
  console.log(`Sanity events: ${report.sanityCount}`);
  console.log("");

  console.log(`New events (${report.newEvents.length})`);
  report.newEvents.forEach((event) => {
    printEventLine("+", event);
    console.log(`  ${event.sourceUrl}`);
  });
  console.log("");

  console.log(`Changed events (${report.changedEvents.length})`);
  report.changedEvents.forEach((entry) => {
    printEventLine("~", entry.source);
    console.log(`  Sanity: ${entry.sanity._id}`);

    entry.changes.forEach((change) => {
      console.log(
        `  - ${String(change.field)}: ${valueToText(change.before)} -> ${valueToText(
          change.after,
        )}`,
      );
    });
  });
  console.log("");

  console.log(`Possibly removed events (${report.possiblyRemovedEvents.length})`);
  report.possiblyRemovedEvents.forEach((event) => {
    printEventLine("-", event);
    console.log(`  Sanity: ${event._id}`);
  });
  console.log("");

  console.log(`Uncertain matches (${report.uncertainMatches.length})`);
  report.uncertainMatches.forEach((entry) => {
    printEventLine("?", entry.source);
    entry.candidates.forEach((candidate) => {
      console.log(
        `  candidate ${candidate.score}: ${candidate.sanity._type} ${candidate.sanity._id} | ${
          candidate.sanity.date || "no date"
        } | ${candidate.sanity.title || "no title"} | ${candidate.reasons.join(", ")}`,
      );
    });
  });

  if (report.skipped.length > 0) {
    console.log("");
    console.log(`Skipped (${report.skipped.length})`);
    report.skipped.slice(0, 20).forEach((entry) => console.log(`  - ${entry}`));
  }

  if (report.errors.length > 0) {
    console.log("");
    console.log(`Errors (${report.errors.length})`);
    report.errors.slice(0, 20).forEach((entry) => console.log(`  - ${entry}`));
  }
}

function printClassifiedReport(classifiedReport: ClassifiedReport) {
  const { summary } = classifiedReport;

  console.log("Threshold Peaks FLVW Classification");
  console.log(`Generated: ${classifiedReport.generatedAt}`);
  console.log(`New events: ${summary.newCount}`);
  console.log(`Changed events: ${summary.changedCount}`);
  console.log(`Normalizations: ${summary.normalizationCount}`);
  console.log(`Additions: ${summary.additionCount}`);
  console.log(`Critical: ${summary.criticalCount}`);
  console.log(`Possibly removed: ${summary.removedCount}`);
  console.log(`Uncertain matches: ${summary.uncertainCount}`);
  console.log(`Errors: ${summary.errorCount}`);
  console.log(`Time-only changes: ${summary.timeOnlyChanged}`);
  console.log(`Changes with time: ${summary.changesWithTime}`);
  console.log("");

  console.log(`Critical cases (${classifiedReport.critical.length})`);
  classifiedReport.critical.forEach((entry) => {
    console.log(
      `! ${entry.date} | ${entry.title} | ${entry.city} #${entry.sourceId}`,
    );
    console.log(`  fields: ${entry.fields.join(", ")}`);
    console.log(`  before: ${valueToText(entry.before)}`);
    console.log(`  after: ${valueToText(entry.after)}`);

    if (entry.removed.length > 0) {
      console.log(`  removed: ${entry.removed.join(", ")}`);
    }

    if (entry.suspicious.length > 0) {
      console.log(`  suspicious: ${entry.suspicious.join(", ")}`);
    }
  });
}

async function commitDistanceUpdates(entries: ClassifiedChangedEvent[]) {
  if (entries.length === 0) return 0;

  const client = createSanityWriteClient();
  const batchSize = 100;
  let committed = 0;

  for (let index = 0; index < entries.length; index += batchSize) {
    const batch = entries.slice(index, index + batchSize);
    let transaction = client.transaction();

    for (const entry of batch) {
      transaction = transaction.patch(entry.sanityId, (patch) =>
        patch.set({ distances: entry.after }),
      );
    }

    await transaction.commit({ visibility: "sync" });
    committed += batch.length;
  }

  return committed;
}

async function runSafeApply(options: CheckOptions): Promise<SafeApplyResult> {
  const report = await runFlvwUpdateCheck(options);
  const classifiedReport = classifyReport(report);

  if (classifiedReport.summary.errorCount > 0) {
    throw new Error("Safe-apply aborted because the read-only check has errors.");
  }

  const safeUpdates = [
    ...classifiedReport.normalization,
    ...classifiedReport.addition,
  ];
  const updateCount = await commitDistanceUpdates(safeUpdates);
  const controlReport = await runFlvwUpdateCheck(options);
  const controlClassification = classifyReport(controlReport);

  return {
    mutationCommitted: updateCount > 0,
    createCount: 0,
    updateCount,
    deleteCount: 0,
    excludedCriticalCount: classifiedReport.critical.length,
    skippedNewCount: classifiedReport.newEvents.length,
    control: {
      createCount: 0,
      updateCount,
      deleteCount: 0,
      remainingChangedCount: controlReport.changedEvents.length,
      remainingCriticalCount: controlClassification.critical.length,
      errorCount: controlReport.errors.length,
      uncertainCount: controlReport.uncertainMatches.length,
      removedCount: controlReport.possiblyRemovedEvents.length,
      timeOnlyChanged: countTimeOnlyChanges(controlReport.changedEvents),
      changesWithTime: countChangesWithTime(controlReport.changedEvents),
    },
  };
}

function readOption(name: string) {
  const prefix = `--${name}=`;
  const inline = process.argv.find((arg) => arg.startsWith(prefix));

  if (inline) return inline.slice(prefix.length);

  const index = process.argv.indexOf(`--${name}`);

  if (index >= 0) return process.argv[index + 1];

  return undefined;
}

function readMode(): RunMode {
  const rawMode =
    readOption("mode") ||
    process.argv.find((arg) => ["check", "classify", "safe-apply"].includes(arg));

  if (rawMode === "classify" || rawMode === "safe-apply") {
    return rawMode;
  }

  return "check";
}

function parseOptions(): CheckOptions {
  const monthsAhead = Number(readOption("months-ahead") || DEFAULT_MONTHS_AHEAD);
  const delayMs = Number(readOption("delay-ms") || DEFAULT_DELAY_MS);
  const limitValue = readOption("limit");
  const limit = limitValue ? Number(limitValue) : undefined;

  return {
    monthsAhead: Number.isFinite(monthsAhead) && monthsAhead >= 0 ? monthsAhead : 12,
    delayMs: Number.isFinite(delayMs) && delayMs >= 0 ? delayMs : 250,
    json: process.argv.includes("--json"),
    mode: readMode(),
    limit: limit && Number.isFinite(limit) && limit > 0 ? limit : undefined,
  };
}

export async function runFlvwUpdateCheck(options = parseOptions()) {
  const today = getTodayKey();
  const monthPairs = getMonthPairs(options.monthsAhead);
  const scanEnd = getScanEnd(monthPairs);
  const [{ events, seenSourceIds, skipped, errors }, sanityEvents] = await Promise.all([
    fetchFlvwEvents(options, today),
    fetchExistingSanityEvents(today, scanEnd),
  ]);

  return createReport(
    events,
    seenSourceIds,
    sanityEvents,
    options,
    today,
    scanEnd,
    skipped,
    errors,
  );
}

function isCliRun() {
  return Boolean(
    process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href,
  );
}

if (isCliRun()) {
  const options = parseOptions();

  if (options.mode === "safe-apply") {
    runSafeApply(options)
      .then((result) => {
        console.log(JSON.stringify(result, null, 2));
      })
      .catch((error) => {
        console.error(error);
        process.exit(1);
      });
  } else {
    runFlvwUpdateCheck(options)
      .then((report) => {
        if (options.mode === "classify") {
          const classifiedReport = classifyReport(report);

          if (options.json) {
            console.log(JSON.stringify(classifiedReport, null, 2));
          } else {
            printClassifiedReport(classifiedReport);
          }

          return;
        }

        if (options.json) {
          console.log(JSON.stringify(report, null, 2));
        } else {
          printReport(report);
        }
      })
      .catch((error) => {
        console.error(error);
        process.exit(1);
      });
  }
}
