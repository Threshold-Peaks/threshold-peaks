export function getGeneratedRouteMapImageUrl({
  activityId,
}: {
  activityId?: string | null;
}) {
  const normalizedActivityId = activityId?.trim();

  if (!normalizedActivityId || !/^\d+$/.test(normalizedActivityId)) {
    return undefined;
  }

  return `/images/runs/${normalizedActivityId}-map.png`;
}

export function resolveRouteMapImageUrl({
  activityId,
  generatedRouteMapUrl,
  sanityRouteMapUrl,
}: {
  activityId?: string | null;
  generatedRouteMapUrl?: string;
  sanityRouteMapUrl?: string;
}) {
  if (activityId) {
    return generatedRouteMapUrl;
  }

  return generatedRouteMapUrl ?? sanityRouteMapUrl;
}
