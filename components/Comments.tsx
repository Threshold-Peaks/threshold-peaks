"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import LikeButton from "@/components/LikeButton";

type CommentTargetType = "journal" | "gallery" | "event";

type PublicComment = {
  _id: string;
  name: string;
  body: string;
  createdAt?: string;
};

type CommentsProps = {
  targetType: CommentTargetType;
  targetSlug: string;
  targetTitle: string;
  footerAction?: ReactNode;
};

function formatCommentDate(date?: string) {
  if (!date) return "Gerade eben";

  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export default function Comments({
  targetType,
  targetSlug,
  targetTitle,
  footerAction,
}: CommentsProps) {
  const [comments, setComments] = useState<PublicComment[]>([]);
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [company, setCompany] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const queryString = useMemo(() => {
    const params = new URLSearchParams({
      targetType,
      targetSlug,
    });

    return params.toString();
  }, [targetSlug, targetType]);

  useEffect(() => {
    let isMounted = true;

    async function loadComments() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/comments?${queryString}`, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Kommentare konnten nicht geladen werden.");
        }

        const data = (await response.json()) as { comments?: PublicComment[] };

        if (isMounted) {
          setComments(data.comments || []);
        }
      } catch {
        if (isMounted) {
          setError("Kommentare konnten gerade nicht geladen werden.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadComments();

    return () => {
      isMounted = false;
    };
  }, [queryString]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = name.trim();
    const trimmedBody = body.trim();

    setMessage(null);
    setError(null);

    if (!trimmedName || !trimmedBody) {
      setError("Bitte gib deinen Namen und einen Kommentar ein.");
      return;
    }

    if (trimmedName.length > 80) {
      setError("Der Name ist etwas zu lang.");
      return;
    }

    if (trimmedBody.length > 1200) {
      setError("Der Kommentar ist etwas zu lang. Maximal 1200 Zeichen.");
      return;
    }

    setIsSending(true);

    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          targetType,
          targetSlug,
          targetTitle,
          name: trimmedName,
          body: trimmedBody,
          company,
        }),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error || "Kommentar konnte nicht gespeichert werden.");
      }

      setName("");
      setBody("");
      setCompany("");
      setMessage(
        "Danke! Dein Kommentar wurde gespeichert und erscheint nach Freigabe.",
      );
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Kommentar konnte gerade nicht gespeichert werden.",
      );
    } finally {
      setIsSending(false);
    }
  }

  return (
    <section className="mt-14 border-t border-black/10 pt-7">
      <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-[10px] font-black uppercase tracking-[0.32em] text-black/35">
            Kommentare
          </h2>
        </div>

        <p className="max-w-sm text-sm font-semibold leading-6 text-black/45 sm:text-right">
          Kommentare erscheinen erst nach Freigabe.
        </p>
      </div>

      <div className="space-y-5">
        {isLoading ? (
          <p className="border-y border-black/10 py-5 text-sm font-semibold text-black/45">
            Kommentare werden geladen …
          </p>
        ) : null}

        {!isLoading && comments.length === 0 ? (
          <p className="border-y border-black/10 py-5 text-sm font-semibold leading-7 text-black/45">
            Noch keine freigegebenen Kommentare. Schreib den ersten Gedanken.
          </p>
        ) : null}

        {comments.length > 0 ? (
          <div className="divide-y divide-black/10 border-y border-black/10">
            {comments.map((comment) => (
              <article key={comment._id} className="py-5">
                <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-black uppercase tracking-[0.22em] text-black/35">
                  <span>{comment.name}</span>
                  <span className="h-1 w-1 rounded-full bg-black/20" />
                  <span>{formatCommentDate(comment.createdAt)}</span>
                </div>

                <p className="max-w-3xl whitespace-pre-line text-sm font-semibold leading-7 text-black/65">
                  {comment.body}
                </p>

                <div className="mt-4 flex items-center justify-start border-t border-black/5 pt-3">
                  <LikeButton
                    targetType="comment"
                    targetId={comment._id}
                    className="tracking-[0.16em]"
                  />
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-8 grid gap-4 border-t border-black/10 pt-6"
      >
        <input
          type="text"
          name="company"
          value={company}
          onChange={(event) => setCompany(event.target.value)}
          className="hidden"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
        />

        <div className="grid items-start gap-4 sm:grid-cols-[minmax(0,220px)_minmax(0,1fr)]">
          <label className="grid content-start gap-2">
            <span className="text-[10px] font-black uppercase tracking-[0.24em] text-black/35">
              Name
            </span>
            <div className="flex min-h-[108px] items-start border-b border-black/15 transition focus-within:border-orange-500">
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={80}
                className="w-full rounded-none border-0 bg-transparent px-0 py-3 text-sm font-semibold text-black outline-none placeholder:text-black/25"
                placeholder="Dein Name"
              />
            </div>
          </label>

          <label className="grid content-start gap-2">
            <span className="text-[10px] font-black uppercase tracking-[0.24em] text-black/35">
              Kommentar
            </span>
            <textarea
              value={body}
              onChange={(event) => setBody(event.target.value)}
              maxLength={1200}
              rows={3}
              className="min-h-[108px] resize-none rounded-none border-0 border-b border-black/15 bg-transparent px-0 py-3 text-sm font-semibold leading-7 text-black outline-none transition placeholder:text-black/25 focus:border-orange-500"
              placeholder="Dein Gedanke dazu …"
            />
          </label>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-h-6 flex-col items-start gap-2">
            {footerAction ? <div>{footerAction}</div> : null}

            {message ? (
              <p className="text-xs font-bold text-orange-600">{message}</p>
            ) : null}
            {error ? (
              <p className="text-xs font-bold text-red-700">{error}</p>
            ) : null}
          </div>

          <button
            type="submit"
            disabled={isSending}
            className="inline-flex items-center justify-between gap-4 border-b border-black/20 pb-2 text-sm font-black text-black/55 transition hover:border-orange-500 hover:text-orange-600 disabled:cursor-not-allowed disabled:opacity-45"
          >
            {isSending ? "Wird gesendet …" : "Kommentar senden"}
            <span>→</span>
          </button>
        </div>
      </form>
    </section>
  );
}
