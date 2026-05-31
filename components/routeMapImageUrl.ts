export function getGeneratedRouteMapImageUrl({
  activityId,
  mapImage,
}: {
  activityId?: string | null;
  mapImage?: unknown;
}) {
  if (!activityId || typeof mapImage !== "string") {
    return undefined;
  }

  const expectedGeneratedMapUrl = `/images/runs/${activityId}-map.png`;
  return mapImage === expectedGeneratedMapUrl ? mapImage : undefined;
}

export function resolveRouteMapImageUrl({
  generatedRouteMapUrl,
  sanityRouteMapUrl,
}: {
  generatedRouteMapUrl?: string;
  sanityRouteMapUrl?: string;
}) {
  return generatedRouteMapUrl ?? sanityRouteMapUrl;
}
