import type { MetadataRoute } from "next";
import { client } from "@/sanity/lib/client";

const baseUrl = "https://www.threshold-peaks.de";

type SitemapItem = {
  slug?: {
    current?: string;
  };
  updatedAt?: string;
};

const journalQuery = `*[_type == "journalPost" && defined(slug.current)] {
  slug,
  "updatedAt": _updatedAt
}`;

const galleryQuery = `*[_type == "galleryAlbum" && defined(slug.current)] {
  slug,
  "updatedAt": _updatedAt
}`;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [journalPosts, galleryAlbums] = await Promise.all([
    client.fetch<SitemapItem[]>(journalQuery),
    client.fetch<SitemapItem[]>(galleryQuery),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/journal`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/gallery`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/events`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/impressum`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${baseUrl}/datenschutz`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];

  const journalRoutes: MetadataRoute.Sitemap = journalPosts.map((post) => ({
    url: `${baseUrl}/journal/${post.slug?.current}`,
    lastModified: post.updatedAt ? new Date(post.updatedAt) : new Date(),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const galleryRoutes: MetadataRoute.Sitemap = galleryAlbums.map((album) => ({
    url: `${baseUrl}/gallery/${album.slug?.current}`,
    lastModified: album.updatedAt ? new Date(album.updatedAt) : new Date(),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...journalRoutes, ...galleryRoutes];
}