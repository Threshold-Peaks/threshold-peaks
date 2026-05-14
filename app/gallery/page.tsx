import BackHeader from "@/components/BackHeader";
import Link from "next/link";
import type { Metadata } from "next";
import { Image } from "next-sanity/image";
import type { SanityImageSource } from "@sanity/image-url";
import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Galerie | Threshold Peaks",
  description:
    "Bilder, Momente und Eindrücke aus Laufen, Radfahren, Musik und aktivem Lifestyle bei Threshold Peaks.",
};

type GalleryTag =
  | string
  | {
      title?: string;
      name?: string;
      label?: string;
      value?: string;
      current?: string;
      slug?: { current?: string };
    };

type GalleryAlbum = {
  _id: string;
  title: string;
  slug?: {
    current?: string;
  };
  category?: string;
  description?: string;
  tags?: string | GalleryTag[];
  coverImage?: SanityImageSource & {
    alt?: string;
    caption?: string;
  };
  imageCount?: number;
};

type GalleryPageProps = {
  searchParams?: Promise<{
    category?: string;
    tag?: string;
    tags?: string;
  }>;
};

const galleryAlbumsQuery = `*[_type == "galleryAlbum" && defined(slug.current)] | order(_createdAt desc) {
  _id,
  title,
  slug,
  category,
  tags,
  "description": coalesce(description, teaser, excerpt),
  "coverImage": coalesce(coverImage, images[0]),
  "imageCount": count(images)
}`;

function formatCategory(category?: string) {
  const categories: Record<string, string> = {
    running: "Running",
    cycling: "Cycling",
    music: "Music",
    lifestyle: "Lifestyle",
    event: "Event",
    laufen: "Running",
    radfahren: "Cycling",
    musik: "Music",
  };

  return category ? (categories[category] ?? category) : "Galerie";
}

function getTagLabel(tag: GalleryTag) {
  const raw =
    typeof tag === "string"
      ? tag
      : tag.title ||
        tag.name ||
        tag.label ||
        tag.value ||
        tag.current ||
        tag.slug?.current ||
        "";

  return raw.replace(/^#/, "").trim();
}

function getGalleryTags(tags?: string | GalleryTag[]) {
  if (!tags) return [];

  if (typeof tags === "string") {
    return Array.from(
      new Set(
        tags
          .split(/[\s,]+/)
          .map((tag) => tag.replace(/^#/, "").trim())
          .filter(Boolean),
      ),
    );
  }

  return Array.from(
    new Set(tags.map((tag) => getTagLabel(tag)).filter(Boolean)),
  );
}

function getSelectedTags(rawTags?: string, rawTag?: string) {
  const raw = rawTags || rawTag || "";

  return Array.from(
    new Set(
      raw
        .split(",")
        .map((tag) => decodeURIComponent(tag).replace(/^#/, "").trim())
        .filter(Boolean),
    ),
  );
}

function isSameTag(a: string, b: string) {
  return a.toLowerCase() === b.toLowerCase();
}

function isTagActive(selectedTags: string[], tag: string) {
  return selectedTags.some((selectedTag) => isSameTag(selectedTag, tag));
}

function toggleTag(selectedTags: string[], tag: string) {
  if (isTagActive(selectedTags, tag)) {
    return selectedTags.filter((selectedTag) => !isSameTag(selectedTag, tag));
  }

  return [...selectedTags, tag];
}

function matchesSelectedTags(album: GalleryAlbum, selectedTags: string[]) {
  if (selectedTags.length === 0) return true;

  const albumTags = getGalleryTags(album.tags);

  return selectedTags.some((selectedTag) =>
    albumTags.some((albumTag) => isSameTag(albumTag, selectedTag)),
  );
}

function getAllTags(albums: GalleryAlbum[]) {
  return Array.from(
    new Set(albums.flatMap((album) => getGalleryTags(album.tags))),
  ).sort((a, b) => a.localeCompare(b, "de"));
}

function getCategoryFilters(albums: GalleryAlbum[]) {
  const preferredOrder = ["running", "cycling", "music", "lifestyle", "event"];
  const albumCategories = Array.from(
    new Set(albums.map((album) => album.category).filter(Boolean) as string[]),
  );

  const orderedCategories = [
    ...preferredOrder.filter((category) => albumCategories.includes(category)),
    ...albumCategories
      .filter((category) => !preferredOrder.includes(category))
      .sort((a, b) => formatCategory(a).localeCompare(formatCategory(b), "de")),
  ];

  return [
    { value: "all", label: "Alle" },
    ...orderedCategories.map((category) => ({
      value: category,
      label: formatCategory(category),
    })),
  ];
}

function getGalleryHref({
  category,
  tags,
}: {
  category?: string;
  tags?: string[];
}) {
  const params = new URLSearchParams();

  if (category && category !== "all") {
    params.set("category", category);
  }

  if (tags && tags.length > 0) {
    params.set("tags", tags.join(","));
  }

  const query = params.toString();

  return query ? `/gallery?${query}` : "/gallery";
}

export default async function GalleryPage({ searchParams }: GalleryPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const selectedCategory = resolvedSearchParams.category || "all";
  const selectedTags = getSelectedTags(
    resolvedSearchParams.tags,
    resolvedSearchParams.tag,
  );

  const albums = await client.fetch<GalleryAlbum[]>(galleryAlbumsQuery);
  const allTags = getAllTags(albums);
  const categoryFilters = getCategoryFilters(albums);

  const filteredAlbums = albums.filter((album) => {
    const matchesCategory =
      selectedCategory === "all" || album.category === selectedCategory;

    return matchesCategory && matchesSelectedTags(album, selectedTags);
  });

  const hasActiveFilters = selectedCategory !== "all" || selectedTags.length > 0;

  return (
    <main className="min-h-screen bg-[#f5f3ee] text-black">
      <BackHeader href="/#portal-gallery" label="Zurück zur Galerie" />

      <section className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
        <div className="mb-12 max-w-3xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-black/50">
            Galerie
          </p>

          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Momente aus Bewegung, Klang und draußen sein.
          </h1>

          <p className="mt-5 text-base leading-7 text-black/65 sm:text-lg">
            Eine Sammlung aus Trainingsmomenten, Touren, Events und kleinen
            Bildern zwischen Asphalt, Trails, Beats und Alltag.
          </p>
        </div>

        <section className="mb-10 rounded-[1.75rem] border border-black/10 bg-white/45 p-5 shadow-sm backdrop-blur sm:p-6">
          <p className="mb-4 text-[10px] font-black uppercase tracking-[0.28em] text-black/35">
            Nach Kategorien filtern
          </p>

          <div className="flex flex-wrap gap-2">
            {categoryFilters.map((filter) => {
              const isActive = selectedCategory === filter.value;

              return (
                <Link
                  key={filter.value}
                  href={getGalleryHref({
                    category: filter.value,
                    tags: selectedTags,
                  })}
                  className={`rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.2em] transition hover:-translate-y-0.5 hover:text-orange-600 ${
                    isActive
                      ? "bg-orange-500 text-white shadow-sm shadow-orange-500/20 hover:bg-orange-600 hover:text-white"
                      : "bg-[#ded9cf] text-black/60 ring-1 ring-black/10"
                  }`}
                >
                  {filter.label}
                </Link>
              );
            })}
          </div>

          {allTags.length > 0 ? (
            <div className="mt-7 border-t border-black/10 pt-5">
              <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[10px] font-black uppercase tracking-[0.28em] text-black/35">
                  {selectedTags.length > 0
                    ? "Aktive Galerie-Hashtags"
                    : "Nach Hashtags filtern"}
                </p>

                {selectedTags.length > 0 ? (
                  <Link
                    href={getGalleryHref({ category: selectedCategory })}
                    className="text-[10px] font-black uppercase tracking-[0.22em] text-black/40 transition hover:text-orange-600"
                  >
                    Filter zurücksetzen
                  </Link>
                ) : null}
              </div>

              <div className="flex flex-wrap gap-x-3 gap-y-2">
                {allTags.map((tag) => {
                  const active = isTagActive(selectedTags, tag);
                  const nextTags = toggleTag(selectedTags, tag);

                  return (
                    <Link
                      key={tag}
                      href={getGalleryHref({
                        category: selectedCategory,
                        tags: nextTags,
                      })}
                      className={
                        active
                          ? "rounded-full border border-orange-500 bg-orange-500 px-4 py-2 text-xs font-black text-white shadow-sm shadow-orange-500/20 transition hover:border-orange-600 hover:bg-orange-600"
                          : "rounded-full border border-black/10 bg-white/55 px-4 py-2 text-xs font-black text-black/50 transition hover:border-orange-500/40 hover:text-orange-600"
                      }
                    >
                      #{tag}
                    </Link>
                  );
                })}
              </div>
            </div>
          ) : null}
        </section>

        {albums.length === 0 ? (
          <div className="rounded-[2rem] border border-black/10 bg-white/70 p-8 shadow-sm">
            <p className="text-sm text-black/60">
              Noch keine Alben vorhanden. Sobald Bilder im CMS gepflegt sind,
              erscheinen sie hier.
            </p>
          </div>
        ) : filteredAlbums.length === 0 ? (
          <div className="rounded-[2rem] border border-black/10 bg-white/70 p-8 shadow-sm">
            <h2 className="text-2xl font-black tracking-tight">
              Keine Alben zu diesem Filter.
            </h2>

            <p className="mt-4 max-w-2xl text-base leading-8 text-black/60">
              Der Filter ist gerade etwas zu eng geschnürt. Setz ihn zurück oder
              wähle andere Hashtags.
            </p>

            <Link
              href="/gallery"
              className="mt-6 inline-flex rounded-full bg-[#ded9cf] px-5 py-3 text-xs font-black uppercase tracking-[0.24em] text-black/65 transition hover:text-orange-600"
            >
              Alle Alben anzeigen
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredAlbums.map((album) => {
              const href = `/gallery/${album.slug?.current}`;
              const albumTags = getGalleryTags(album.tags);

              return (
                <article
                  key={album._id}
                  className="overflow-hidden rounded-[2rem] border border-black/10 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <Link href={href} className="group block">
                    <div className="relative aspect-[4/3] overflow-hidden bg-black/5">
                      {album.coverImage ? (
                        <Image
                          src={urlFor(album.coverImage)
                            .width(900)
                            .height(675)
                            .fit("crop")
                            .url()}
                          alt={
                            album.coverImage.alt ||
                            album.title ||
                            "Galeriealbum"
                          }
                          width={900}
                          height={675}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-black/40">
                          Kein Bild vorhanden
                        </div>
                      )}
                    </div>

                    <div className="p-6">
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        {album.category ? (
                          <span className="rounded-full bg-black/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-black/55">
                            {formatCategory(album.category)}
                          </span>
                        ) : null}

                        {typeof album.imageCount === "number" ? (
                          <span className="rounded-full bg-black/5 px-3 py-1 text-xs font-medium text-black/50">
                            {album.imageCount} Bilder
                          </span>
                        ) : null}
                      </div>

                      <h2 className="text-xl font-semibold tracking-tight transition group-hover:text-orange-600">
                        {album.title}
                      </h2>

                      {album.description ? (
                        <p className="mt-3 line-clamp-3 text-sm leading-6 text-black/60">
                          {album.description}
                        </p>
                      ) : null}

                      <p className="mt-5 text-sm font-medium text-black transition group-hover:translate-x-1 group-hover:text-orange-600">
                        Album ansehen →
                      </p>
                    </div>
                  </Link>

                  {albumTags.length > 0 ? (
                    <div className="flex flex-wrap gap-x-3 gap-y-1 px-6 pb-6">
                      {albumTags.map((tag) => {
                        const active = isTagActive(selectedTags, tag);
                        const nextTags = toggleTag(selectedTags, tag);

                        return (
                          <Link
                            key={tag}
                            href={getGalleryHref({
                              category: selectedCategory,
                              tags: nextTags,
                            })}
                            className={
                              active
                                ? "px-1 text-[10px] font-bold tracking-[0.04em] text-orange-600"
                                : "px-1 text-[10px] font-bold tracking-[0.04em] text-black/35 transition hover:text-orange-600"
                            }
                          >
                            #{tag}
                          </Link>
                        );
                      })}
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        )}

        {hasActiveFilters ? (
          <div className="mt-10 border-t border-black/10 pt-6">
            <Link
              href="/gallery"
              className="inline-flex border-b border-black/20 pb-2 text-sm font-black text-black/55 transition hover:border-orange-500 hover:text-orange-600"
            >
              Alle Galerie-Filter zurücksetzen
            </Link>
          </div>
        ) : null}
      </section>
    </main>
  );
}
