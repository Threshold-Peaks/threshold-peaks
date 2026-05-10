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
          background: "#f5f3ee",
          color: "#111217",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          fontFamily: "Arial, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: "-120px",
            top: "-120px",
            width: "440px",
            height: "440px",
            borderRadius: "999px",
            background: "rgba(17,18,23,0.055)",
            display: "flex",
          }}
        />

        <div
          style={{
            position: "absolute",
            left: "-160px",
            bottom: "-180px",
            width: "540px",
            height: "540px",
            borderRadius: "999px",
            background: "rgba(17,18,23,0.045)",
            display: "flex",
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "26px",
          }}
        >
          <div
            style={{
              width: "104px",
              height: "62px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="104"
              height="62"
              viewBox="0 0 80 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 36H18L30 14L43 36L55 22L74 36"
                stroke="#111217"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M30 14L36 25L43 36"
                stroke="#111217"
                strokeWidth="2.5"
                strokeLinecap="round"
                opacity="0.35"
              />
            </svg>
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
                fontSize: "36px",
                fontWeight: 900,
                letterSpacing: "0.24em",
                textTransform: "uppercase",
              }}
            >
              Threshold Peaks
            </div>

            <div
              style={{
                display: "flex",
                marginTop: "9px",
                fontSize: "17px",
                fontWeight: 800,
                letterSpacing: "0.34em",
                textTransform: "uppercase",
                color: "rgba(17,18,23,0.55)",
              }}
            >
              Beat the extra mile
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: "30px",
          }}
        >
          <div
            style={{
              display: "flex",
              width: "86px",
              height: "3px",
              background: "rgba(17,18,23,0.45)",
              marginBottom: "34px",
            }}
          />

          <div
            style={{
              display: "flex",
              maxWidth: "980px",
              fontSize: "96px",
              lineHeight: 0.9,
              letterSpacing: "-0.075em",
              fontWeight: 950,
            }}
          >
            Bewegung ist Freiheit.
          </div>

          <div
            style={{
              display: "flex",
              marginTop: "34px",
              maxWidth: "900px",
              fontSize: "30px",
              lineHeight: 1.35,
              color: "rgba(17,18,23,0.68)",
              fontWeight: 700,
            }}
          >
            Laufen · Radfahren · elektronische Musik · Strava · Journal
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "21px",
            fontWeight: 800,
            color: "rgba(17,18,23,0.55)",
          }}
        >
          <div style={{ display: "flex" }}>www.threshold-peaks.de</div>

          <div
            style={{
              display: "flex",
              padding: "14px 22px",
              borderRadius: "999px",
              background: "#111217",
              color: "#ffffff",
              fontSize: "18px",
              fontWeight: 900,
              letterSpacing: "0.08em",
            }}
          >
            Running · Cycling · Music
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}