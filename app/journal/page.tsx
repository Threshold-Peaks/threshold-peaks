import BackHeader from "@/components/BackHeader";
import Link from "next/link";
import { Image } from "next-sanity/image";
import type { SanityImageSource } from "@sanity/image-url";
import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";

export const revalidate = 60;

type JournalTag =
  | string
  | {
      title?: string;
      name?: string;
      label?: string;
      value?: string;
      current?: string;
      slug?: { current?: string };
    };

type SanityJournalPost = {
  _id: string;
  title: string;
  slug?: {
    current?: string;
  };
  publishedAt?: string;
  category?: string;
  excerpt?: string;
  featured?: boolean;
  tags?: string | JournalTag[];
  mainImage?: SanityImageSource & {
    alt?: string;
  };
};

type JournalPageProps = {
  searchParams?: Promise<{
    category?: string;
    tag?: string;
  }>;
};

const categoryFilters = [
  { label: "Alle", value: "all" },
  { label: "Running", value: "running" },
  { label: "Cycling", value: "cycling" },
  { label: "Music", value: "music" },
  { label: "Lifestyle", value: "lifestyle" },
  { label: "Event", value: "event" },
];

const query = `*[_type == "journalPost"] | order(publishedAt desc) {
  _id,
  title,
  slug,
  publishedAt,
  category,
  excerpt,
  featured,
  tags,
  mainImage
}`;

function formatDate(date?: string) {
  if (!date) return "Ohne Datum";

  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

function formatCategory(category?: string) {
  const categories: Record<string, string> = {
    running: "Running",
    cycling: "Cycling",
    music: "Music",
    story: "Story",
    lifestyle: "Lifestyle",
    gear: "Gear",
    event: "Event Recap",

    laufen: "Running",
    radfahren: "Cycling",
    musik: "Music",
  };

  return category ? categories[category] ?? category : "Journal";
}

function getJournalTagLabel(tag: JournalTag) {
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

function getJournalTags(tags?: string | JournalTag[]) {
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
    new Set(tags.map((tag) => getJournalTagLabel(tag)).filter(Boolean)),
  );
}

function normalizeFilterValue(value?: string) {
  return decodeURIComponent(value || "")
    .replace(/^#/, "")
    .trim()
    .toLowerCase();
}

function getFilterHref(category: string) {
  if (category === "all") {
    return "/journal";
  }

  return `/journal?category=${encodeURIComponent(category)}`;
}

function getTagHref(tag: string) {
  return `/journal?tag=${encodeURIComponent(tag)}`;
}

function getAllTags(posts: SanityJournalPost[]) {
  const tags = posts.flatMap((post) => getJournalTags(post.tags));

  return Array.from(new Set(tags)).sort((a, b) =>
    a.localeCompare(b, "de", { sensitivity: "base" }),
  );
}

export default async function JournalPage({ searchParams }: JournalPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const selectedCategory = resolvedSearchParams.category || "all";
  const selectedTag = normalizeFilterValue(resolvedSearchParams.tag);

  const posts = await client.fetch<SanityJournalPost[]>(query);
  const allTags = getAllTags(posts);

  const filteredPosts = posts.filter((post) => {
    const categoryMatches =
      selectedCategory === "all" || post.category === selectedCategory;
    const tagMatches =
      !selectedTag ||
      getJournalTags(post.tags).some(
        (tag) => normalizeFilterValue(tag) === selectedTag,
      );

    return categoryMatches && tagMatches;
  });

  const hasActiveFilter = selectedCategory !== "all" || Boolean(selectedTag);

  return (
    <main className="min-h-screen bg-[#f5f3ee] text-black">
      <BackHeader />

      <section className="px-6 pb-14 pt-8 md:px-10 md:pb-16 lg:px-20">
        <div className="mx-auto max-w-[1280px]">
          <div className="mb-10 max-w-3xl">
            <p className="mb-5 text-xs font-bold uppercase tracking-[0.55em] text-neutral-500">
              Journal
            </p>

            <h1 className="text-5xl font-black leading-none tracking-tight md:text-7xl">
              Gedanken aus Bewegung, Klang und Alltag.
            </h1>

            <p className="mt-8 max-w-2xl text-lg leading-8 text-neutral-600">
              Training, Wettkämpfe, Gravelrunden, Musik und persönliche
              Entwicklung. Hier sammle ich Beiträge, Ideen und Geschichten rund
              um Threshold Peaks.
            </p>
          </div>

          <div className="mb-6">
            <p className="mb-3 text-[10px] font-black uppercase tracking-[0.32em] text-black/35">
              Kategorien
            </p>

            <div className="flex flex-wrap gap-3">
              {categoryFilters.map((filter) => {
                const isActive =
                  !selectedTag && selectedCategory === filter.value;

                return (
                  <Link
                    key={filter.value}
                    href={getFilterHref(filter.value)}
                    className={`rounded-full px-5 py-3 text-xs font-black uppercase tracking-[0.24em] shadow-sm ring-1 ring-black/10 transition hover:-translate-y-0.5 hover:text-orange-600 ${
                      isActive
                        ? "bg-orange-500 text-white shadow-orange-500/20 hover:bg-orange-600 hover:text-white"
                        : "bg-[#ded9cf] text-black/65"
                    }`}
                  >
                    {filter.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {allTags.length > 0 ? (
            <div className="mb-10">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <p className="text-[10px] font-black uppercase tracking-[0.32em] text-black/35">
                  Tags
                </p>

                {hasActiveFilter ? (
                  <Link
                    href="/journal"
                    className="border-b border-black/20 pb-1 text-xs font-black uppercase tracking-[0.22em] text-black/45 transition hover:border-orange-500 hover:text-orange-600"
                  >
                    Filter zurücksetzen
                  </Link>
                ) : null}
              </div>

              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => {
                  const isActive = normalizeFilterValue(tag) === selectedTag;

                  return (
                    <Link
                      key={tag}
                      href={getTagHref(tag)}
                      className={`rounded-full border px-4 py-2 text-xs font-black transition hover:-translate-y-0.5 hover:border-orange-500/50 hover:text-orange-600 ${
                        isActive
                          ? "border-orange-500 bg-orange-500 text-white shadow-sm shadow-orange-500/20 hover:border-orange-600 hover:bg-orange-600 hover:text-white"
                          : "border-black/10 bg-white/55 text-black/55"
                      }`}
                    >
                      #{tag}
                    </Link>
                  );
                })}
              </div>
            </div>
          ) : null}

          {filteredPosts.length === 0 ? (
            <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-black/10">
              <h2 className="text-2xl font-black tracking-tight">
                Keine Beiträge für diesen Filter.
              </h2>

              <p className="mt-4 text-base leading-8 text-neutral-600">
                Sobald du im Sanity Studio passende Journal-Beiträge
                veröffentlichst, erscheinen sie hier.
              </p>

              <Link
                href="/journal"
                className="mt-6 inline-flex rounded-full bg-[#ded9cf] px-5 py-3 text-xs font-black uppercase tracking-[0.24em] text-black/65 transition hover:text-orange-600"
              >
                Alle Beiträge anzeigen
              </Link>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
              {filteredPosts.map((post) => {
                const href = post.slug?.current
                  ? `/journal/${post.slug.current}`
                  : "/journal";
                const tags = getJournalTags(post.tags).slice(0, 4);

                return (
                  <Link
                    key={post._id}
                    href={href}
                    className="group block overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-black/10 transition hover:-translate-y-1 hover:shadow-md"
                  >
                    <article className="flex h-full flex-col">
                      {post.mainImage ? (
                        <div className="overflow-hidden bg-[#ded9cf]">
                          <Image
                            src={urlFor(post.mainImage)
                              .width(900)
                              .height(600)
                              .url()}
                            alt={post.mainImage.alt || post.title}
                            width={900}
                            height={600}
                            className="aspect-[16/10] w-full object-cover transition duration-500 group-hover:scale-105"
                          />
                        </div>
                      ) : (
                        <div className="flex aspect-[16/10] items-center justify-center bg-[#ded9cf] px-8 text-center">
                          <p className="text-xs font-black uppercase tracking-[0.32em] text-black/40">
                            Threshold Peaks Journal
                          </p>
                        </div>
                      )}

                      <div className="flex flex-1 flex-col p-7">
                        <div className="mb-6 flex flex-wrap items-center gap-3">
                          <span className="inline-flex rounded-full bg-[#ded9cf] px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-neutral-700">
                            {formatCategory(post.category)}
                          </span>

                          {post.featured ? (
                            <span className="inline-flex rounded-full bg-black px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white">
                              Featured
                            </span>
                          ) : (
                            <span className="inline-flex rounded-full bg-[#f5f3ee] px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-neutral-500 ring-1 ring-black/10">
                              Live
                            </span>
                          )}
                        </div>

                        <p className="mb-4 text-xs font-black uppercase tracking-[0.25em] text-neutral-500">
                          {formatDate(post.publishedAt)}
                        </p>

                        <h2 className="text-2xl font-black leading-tight tracking-tight text-black transition group-hover:text-orange-600">
                          {post.title}
                        </h2>

                        <p className="mt-5 leading-7 text-neutral-600">
                          {post.excerpt ||
                            "Ein neuer Beitrag aus dem Threshold Peaks Journal."}
                        </p>

                        {tags.length > 0 ? (
                          <div className="mt-6 flex flex-wrap gap-2">
                            {tags.map((tag) => (
                              <span
                                key={tag}
                                className="rounded-full border border-black/10 bg-[#f5f3ee] px-3 py-1.5 text-[11px] font-black text-black/45"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        ) : null}

                        <div className="mt-auto border-t border-neutral-200 pt-5">
                          <div className="flex items-center justify-between text-sm font-black text-black">
                            <span>Lesen</span>
                            <span className="transition group-hover:translate-x-1 group-hover:text-orange-600">
                              →
                            </span>
                          </div>
                        </div>
                      </div>
                    </article>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
