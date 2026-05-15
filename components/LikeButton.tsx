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
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(storageKey);

    if (stored === "true") {
      setLiked(true);
    }

    setReady(true);
  }, [storageKey]);

  function handleClick() {
    const nextLiked = !liked;

    setLiked(nextLiked);
    window.localStorage.setItem(storageKey, String(nextLiked));
  }

  const displayCount = Math.max(0, initialCount + (liked ? 1 : 0));

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={liked}
      aria-label={liked ? "Gefällt dir" : "Gefällt mir"}
      className={[
        "group inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.22em]",
        "text-black/35 transition duration-200 hover:text-orange-600",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-4 focus-visible:ring-offset-[#f5f3ee]",
        !ready ? "opacity-70" : "",
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
        {displayCount}
      </span>
    </button>
  );
}