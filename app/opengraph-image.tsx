import { ImageResponse } from "next/og";

export const alt = "Threshold Peaks - Beat the extra mile";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          background: "#f7f7f5",
          color: "#111217",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: "34px",
              fontWeight: 900,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
            }}
          >
            Threshold Peaks
          </div>

          <div
            style={{
              display: "flex",
              fontSize: "18px",
              fontWeight: 800,
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "rgba(17,18,23,0.55)",
            }}
          >
            Beat the extra mile
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              width: "90px",
              height: "3px",
              background: "rgba(17,18,23,0.45)",
              marginBottom: "36px",
            }}
          />

          <div
            style={{
              display: "flex",
              maxWidth: "900px",
              fontSize: "88px",
              lineHeight: 0.92,
              letterSpacing: "-0.065em",
              fontWeight: 900,
            }}
          >
            Bewegung ist Freiheit.
          </div>

          <div
            style={{
              display: "flex",
              marginTop: "34px",
              maxWidth: "820px",
              fontSize: "30px",
              lineHeight: 1.35,
              color: "rgba(17,18,23,0.68)",
              fontWeight: 500,
            }}
          >
            Laufen · Radfahren · elektronische Musik · Strava · Journal
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "22px",
            fontWeight: 800,
            color: "rgba(17,18,23,0.55)",
          }}
        >
          <div style={{ display: "flex" }}>www.threshold-peaks.de</div>
          <div style={{ display: "flex" }}>Running · Cycling · Music</div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}