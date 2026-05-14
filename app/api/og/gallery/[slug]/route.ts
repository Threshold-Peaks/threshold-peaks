import React from "react";
import { ImageResponse } from "next/og";
import type { SanityImageSource } from "@sanity/image-url";
import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";

export const runtime = "edge";
export const revalidate = 60;

const size = {
  width: 1200,
  height: 1200,
};

const el = React.createElement;

function truncateText(text?: string, maxLength = 92) {
  if (!text) return "";
  return text.length > maxLength ? `${text.slice(0, maxLength - 1)}…` : text;
}

function createOgImage({
  title,
  description,
  imageUrl,
  imageAlt,
  label,
}: {
  title: string;
  description: string;
  imageUrl: string | null;
  imageAlt: string;
  label: string;
}) {
  return new ImageResponse(
    el(
      "div",
      {
        style: {
          position: "relative",
          display: "flex",
          width: "100%",
          height: "100%",
          flexDirection: "column",
          overflow: "hidden",
          background: "#f5f3ee",
          color: "#111217",
          fontFamily: "Arial, Helvetica, sans-serif",
        },
      },
      el("div", {
        style: {
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 80% 18%, rgba(255, 96, 0, 0.12), transparent 34%), radial-gradient(circle at 18% 78%, rgba(0,0,0,0.05), transparent 32%)",
        },
      }),
      el(
        "div",
        {
          style: {
            position: "relative",
            display: "flex",
            height: "100%",
            flexDirection: "column",
            padding: "70px 78px 64px",
          },
        },
        el(
          "div",
          {
            style: {
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid rgba(17, 18, 23, 0.12)",
              paddingBottom: 26,
            },
          },
          el(
            "div",
            {
              style: {
                fontSize: 20,
                fontWeight: 800,
                letterSpacing: "0.38em",
                color: "rgba(17, 18, 23, 0.46)",
              },
            },
            "THRESHOLD PEAKS",
          ),
          el(
            "div",
            {
              style: {
                fontSize: 22,
                fontWeight: 800,
                color: "rgba(17, 18, 23, 0.5)",
              },
            },
            label,
          ),
        ),
        el(
          "div",
          {
            style: {
              display: "flex",
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              padding: "42px 0 34px",
            },
          },
          imageUrl
            ? el("img", {
                src: imageUrl,
                alt: imageAlt,
                width: 900,
                height: 650,
                style: {
                  width: 900,
                  height: 650,
                  objectFit: "contain",
                  borderRadius: 42,
                },
              })
            : el(
                "div",
                {
                  style: {
                    display: "flex",
                    width: 920,
                    height: 620,
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 42,
                    background: "rgba(255,255,255,0.42)",
                    fontSize: 72,
                    fontWeight: 900,
                    letterSpacing: "-0.05em",
                  },
                },
                "Threshold Peaks",
              ),
        ),
        el(
          "div",
          {
            style: {
              display: "flex",
              flexDirection: "column",
              borderTop: "1px solid rgba(17, 18, 23, 0.12)",
              paddingTop: 28,
            },
          },
          el(
            "div",
            {
              style: {
                fontSize: 48,
                fontWeight: 900,
                lineHeight: 1.05,
                letterSpacing: "-0.055em",
              },
            },
            truncateText(title, 58),
          ),
          el(
            "div",
            {
              style: {
                marginTop: 14,
                fontSize: 25,
                fontWeight: 600,
                lineHeight: 1.35,
                color: "rgba(17, 18, 23, 0.58)",
              },
            },
            truncateText(description, 105),
          ),
        ),
      ),
    ),
    size,
  );
}

type GalleryOgAlbum = {
  title?: string;
  description?: string;
  coverImage?: SanityImageSource & {
    alt?: string;
  };
};

const query = `*[_type == "galleryAlbum" && slug.current == $slug][0]{
  title,
  "description": coalesce(description, teaser, excerpt),
  "coverImage": coalesce(coverImage, images[0])
}`;

async function getGalleryOgAlbum(slug: string) {
  return client.fetch<GalleryOgAlbum | null>(query, { slug });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const album = await getGalleryOgAlbum(slug);

  const title = album?.title || "Threshold Peaks Galerie";
  const description =
    album?.description || "Bilder und Momente aus der Threshold Peaks Galerie.";
  const imageUrl = album?.coverImage
    ? urlFor(album.coverImage).width(900).fit("max").format("jpg").quality(92).url()
    : null;

  return createOgImage({
    title,
    description,
    imageUrl,
    imageAlt: album?.coverImage?.alt || title,
    label: "Galerie",
  });
}
