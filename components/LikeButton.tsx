"use client";

import { useEffect, useMemo, useState } from "react";

type LikeTargetType =
  | "journal"
  | "galleryAlbum"
  | "galleryImage"
  | "event"
  | "comment";

type LikeButtonProps = {
  targetType: LikeTargetType;
  targetId: string;
  initialCount?: number;
  showLabel?: boolean;
  className?: string;
};

export default function LikeButton({
  targetType,
  targetId,
  initialCount = 0,
  showLabel = false,
  className = "",
}: LikeButtonProps) {
  const storageKey = useMemo(
    () => `threshold-peaks-like:${targetType}:${targetId}`,
    [targetType, targetId]
  );

  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(initialCount);
  const [ready, setReady] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(storageKey);

    if (stored === "true") {
      queueMicrotask(() => setLiked(true));
    }

    async function loadCount() {
      try {
        const params = new URLSearchParams({
          targetType,
          targetId,
        });

        const response = await fetch(`/api/likes?${params.toString()}`, {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Like count konnte nicht geladen werden.");
        }

        const data = await response.json();

        if (typeof data.count === "number") {
          setCount(Math.max(0, data.count));
        }
      } catch {
        setCount(initialCount);
      } finally {
        setReady(true);
      }
    }

    loadCount();
  }, [initialCount, storageKey, targetId, targetType]);

  async function handleClick() {
    if (isSaving || !ready) {
      return;
    }

    const nextLiked = !liked;
    const action = nextLiked ? "like" : "unlike";
    const optimisticCount = Math.max(0, count + (nextLiked ? 1 : -1));

    setLiked(nextLiked);
    setCount(optimisticCount);
    setIsSaving(true);

    if (nextLiked) {
      window.localStorage.setItem(storageKey, "true");
    } else {
      window.localStorage.removeItem(storageKey);
    }

    try {
      const response = await fetch("/api/likes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          targetType,
          targetId,
          action,
        }),
      });

      if (!response.ok) {
        throw new Error("Like konnte nicht gespeichert werden.");
      }

      const data = await response.json();

      if (typeof data.count === "number") {
        setCount(Math.max(0, data.count));
      }
    } catch {
      setLiked(!nextLiked);
      setCount(count);

      if (liked) {
        window.localStorage.setItem(storageKey, "true");
      } else {
        window.localStorage.removeItem(storageKey);
      }
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!ready || isSaving}
      aria-pressed={liked}
      aria-label={liked ? "Gefällt dir" : "Gefällt mir"}
      className={[
        "group inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.22em]",
        "text-black/35 transition duration-200 hover:text-orange-600 disabled:cursor-wait disabled:opacity-60",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-4 focus-visible:ring-offset-[#f5f3ee]",
        className,
      ].join(" ")}
    >
      <span
        className={[
          "text-lg leading-none transition duration-200 group-hover:scale-110",
          liked ? "text-orange-600" : "text-black/35",
        ].join(" ")}
      >
        {liked ? "♥" : "♡"}
      </span>

      {showLabel ? (
        <span>{liked ? "Gefällt dir" : "Gefällt mir"}</span>
      ) : null}

      <span className={liked ? "text-black/60" : "text-black/30"}>
        {count}
      </span>
    </button>
  );
}
