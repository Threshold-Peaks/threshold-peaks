import { NextResponse } from "next/server";

// Die Importlogik liegt bewusst weiter in scripts/import-flvw-events.mjs,
// damit npm run import:flvw lokal weiter funktioniert.
// @ts-ignore - Das Node-ESM-Script hat keine eigene TypeScript-Deklaration.
import { runFlvwImport } from "../../../../scripts/import-flvw-events.mjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

function getDelayMs() {
  const value = Number(process.env.FLVW_CRON_DELAY_MS || 80);

  return Number.isFinite(value) && value >= 0 ? value : 80;
}

export async function GET(request: Request) {
  const expectedSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  if (!expectedSecret) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "CRON_SECRET fehlt. Bitte in Vercel unter Project Settings > Environment Variables setzen.",
      },
      { status: 500 },
    );
  }

  if (authHeader !== `Bearer ${expectedSecret}`) {
    return NextResponse.json(
      {
        ok: false,
        error: "Unauthorized",
      },
      { status: 401 },
    );
  }

  const startedAt = Date.now();
  const logs: string[] = [];

  try {
    const result = await runFlvwImport({
      dryRun: false,
      delayMs: getDelayMs(),
      log: (...entries: unknown[]) => {
        logs.push(entries.map(String).join(" "));
      },
      warn: (...entries: unknown[]) => {
        logs.push(`[WARN] ${entries.map(String).join(" ")}`);
      },
    });

    return NextResponse.json({
      ok: true,
      durationMs: Date.now() - startedAt,
      ...result,
      logs: logs.slice(-80),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    return NextResponse.json(
      {
        ok: false,
        durationMs: Date.now() - startedAt,
        error: message,
        logs: logs.slice(-80),
      },
      { status: 500 },
    );
  }
}
