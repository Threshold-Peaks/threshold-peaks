import Link from "next/link";
import { Image } from "next-sanity/image";
import type { SanityImageSource } from "@sanity/image-url";
import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";

const filters = ["Alle", "Running", "Cycling", "Music", "Story"];

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
  mainImage?: SanityImageSource & {
    alt?: string;
  };
};

const query = `*[_type == "journalPost"] | order(publishedAt desc) {
  _id,
  title,
  slug,
  publishedAt,
  category,
  excerpt,
  featured,
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
    laufen: "Running",
    radfahren: "Cycling",
    musik: "Music",
    lifestyle: "Story",
    event: "Event",
  };

  return category ? categories[category] ?? category : "Story";
}

export default async function JournalPage() {
  const posts = await client.fetch<SanityJournalPost[]>(query);

  return (
    <main className="min-h-screen bg-[#f5f3ee] text-black">
      <section className="px-6 py-16 md:px-10 lg:px-20">
        <div className="mx-auto max-w-[1280px]">
          <div className="mb-10">
            <Link
              href="/"
              className="inline-flex rounded-full bg-[#ded9cf] px-5 py-3 text-sm font-bold text-black shadow-sm transition hover:bg-[#d1ccc3]"
            >
              ← Zurück zur Startseite
            </Link>
          </div>

          <div className="max-w-3xl">
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

          <div className="mt-12 flex flex-wrap gap-3">
            {filters.map((filter) => (
              <button
                key={filter}
                type="button"
                className="rounded-full bg-[#ded9cf] px-5 py-3 text-xs font-bold uppercase tracking-[0.25em] text-neutral-700 shadow-sm transition hover:bg-[#d1ccc3]"
              >
                {filter}
              </button>
            ))}
          </div>

          {posts.length === 0 ? (
            <div className="mt-10 rounded-3xl bg-white p-8 shadow-sm ring-1 ring-black/10">
              <h2 className="text-2xl font-black tracking-tight">
                Noch keine Beiträge veröffentlicht.
              </h2>

              <p className="mt-4 text-base leading-8 text-neutral-600">
                Sobald du im Sanity Studio einen Journal-Beitrag
                veröffentlichst, erscheint er hier automatisch.
              </p>
            </div>
          ) : (
            <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {posts.map((post) => {
                const slug = post.slug?.current;
                const href = slug ? `/journal/${slug}` : "#";

                return (
                  <article
                    key={post._id}
                    className="rounded-3xl bg-white p-7 shadow-sm ring-1 ring-black/10 transition hover:-translate-y-1 hover:shadow-md"
                  >
                    {post.mainImage && (
                      <div className="mb-6 overflow-hidden rounded-2xl bg-[#ded9cf]">
                        <Image
                          src={urlFor(post.mainImage)
                            .width(800)
                            .height(520)
                            .url()}
                          alt={post.mainImage.alt || post.title}
                          width={800}
                          height={520}
                          className="h-56 w-full object-cover"
                        />
                      </div>
                    )}

                    <div className="mb-8 flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.45em] text-neutral-400">
                          {formatCategory(post.category)}
                        </p>

                        <p className="mt-3 text-sm font-black uppercase tracking-[0.25em] text-neutral-500">
                          {formatDate(post.publishedAt)}
                        </p>
                      </div>

                      <div className="rounded-full bg-[#ded9cf] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.25em] text-neutral-700 shadow-sm">
                        {post.featured ? "Featured" : "Live"}
                      </div>
                    </div>

                    <h2 className="text-2xl font-black leading-tight tracking-tight text-black">
                      {post.title}
                    </h2>

                    <p className="mt-5 min-h-24 text-base leading-8 text-neutral-600">
                      {post.excerpt ||
                        "Ein neuer Beitrag aus dem Threshold Peaks Journal."}
                    </p>

                    <div className="mt-8 border-t border-neutral-200 pt-5">
                      <Link
                        href={href}
                        className="group flex items-center justify-between text-sm font-black text-black"
                      >
                        <span>Lesen</span>
                        <span className="transition group-hover:translate-x-1">
                          →
                        </span>
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}