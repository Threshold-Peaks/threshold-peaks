import Link from "next/link";
import { notFound } from "next/navigation";
import { PortableText } from "@portabletext/react";
import { client } from "@/sanity/lib/client";

type JournalPost = {
  title: string;
  publishedAt?: string;
  category?: string;
  excerpt?: string;
  body?: any[];
  stravaUrl?: string;
  soundcloudUrl?: string;
};

const query = `*[_type == "journalPost" && slug.current == $slug][0]{
  title,
  publishedAt,
  category,
  excerpt,
  body,
  stravaUrl,
  soundcloudUrl
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

export default async function JournalPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await client.fetch<JournalPost | null>(query, { slug });

  if (!post) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#f5f3ee] text-black">
      <article className="mx-auto max-w-3xl px-6 py-16">
        <div className="mb-10">
          <Link
            href="/journal"
            className="inline-flex rounded-full bg-[#ded9cf] px-5 py-3 text-sm font-bold text-black shadow-sm transition hover:bg-[#d1ccc3]"
          >
            ← Zurück zum Journal
          </Link>
        </div>

        <div className="mb-8 flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-[#ded9cf] px-4 py-2 text-xs font-bold uppercase tracking-[0.25em] text-neutral-700">
            {formatCategory(post.category)}
          </span>

          <span className="text-xs font-black uppercase tracking-[0.25em] text-neutral-500">
            {formatDate(post.publishedAt)}
          </span>
        </div>

        <h1 className="text-5xl font-black leading-none tracking-tight md:text-7xl">
          {post.title}
        </h1>

        {post.excerpt && (
          <p className="mt-8 text-xl leading-9 text-neutral-600">
            {post.excerpt}
          </p>
        )}

        <div className="mt-12 rounded-3xl bg-white p-8 shadow-sm ring-1 ring-black/10">
          {post.body && post.body.length > 0 ? (
            <div className="prose prose-neutral max-w-none prose-p:text-base prose-p:leading-8 prose-headings:font-black">
              <PortableText value={post.body} />
            </div>
          ) : (
            <p className="text-base leading-8 text-neutral-600">
              Für diesen Beitrag wurde noch kein Text hinterlegt.
            </p>
          )}
        </div>

        {(post.stravaUrl || post.soundcloudUrl) && (
          <div className="mt-8 flex flex-wrap gap-3">
            {post.stravaUrl && (
              <Link
                href={post.stravaUrl}
                target="_blank"
                className="rounded-full bg-black px-5 py-3 text-sm font-bold text-white transition hover:bg-neutral-800"
              >
                Strava öffnen
              </Link>
            )}

            {post.soundcloudUrl && (
              <Link
                href={post.soundcloudUrl}
                target="_blank"
                className="rounded-full bg-black px-5 py-3 text-sm font-bold text-white transition hover:bg-neutral-800"
              >
                SoundCloud öffnen
              </Link>
            )}
          </div>
        )}
      </article>
    </main>
  );
}