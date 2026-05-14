import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Threshold Peaks | Beat the extra mile";

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
          fontFamily: "Arial, Helvetica, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: "-150px",
            top: "-150px",
            width: "470px",
            height: "470px",
            borderRadius: "999px",
            background: "rgba(17,18,23,0.045)",
            display: "flex",
          }}
        />

        <div
          style={{
            position: "absolute",
            left: "-180px",
            bottom: "-210px",
            width: "560px",
            height: "560px",
            borderRadius: "999px",
            background: "rgba(234,88,12,0.075)",
            display: "flex",
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid rgba(17,18,23,0.14)",
            paddingBottom: "30px",
          }}
        >
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

            <div style={{ display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  display: "flex",
                  fontSize: "35px",
                  fontWeight: 900,
                  letterSpacing: "0.23em",
                  textTransform: "uppercase",
                }}
              >
                Threshold Peaks
              </div>

              <div
                style={{
                  display: "flex",
                  marginTop: "10px",
                  fontSize: "16px",
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
              color: "#ea580c",
              fontSize: "16px",
              fontWeight: 900,
              letterSpacing: "0.24em",
              textTransform: "uppercase",
            }}
          >
            Puls · Bass · Bewegung
          </div>
        </div>

        <div
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            flexDirection: "column",
            marginTop: "34px",
          }}
        >
          <div
            style={{
              display: "flex",
              width: "86px",
              height: "3px",
              background: "rgba(17,18,23,0.42)",
              marginBottom: "34px",
            }}
          />

          <div
            style={{
              display: "flex",
              maxWidth: "1000px",
              fontSize: "86px",
              lineHeight: 0.94,
              letterSpacing: "-0.065em",
              fontWeight: 950,
            }}
          >
            Puls. Bass. Draußen unterwegs.
          </div>

          <div
            style={{
              display: "flex",
              marginTop: "34px",
              maxWidth: "900px",
              fontSize: "28px",
              lineHeight: 1.35,
              color: "rgba(17,18,23,0.68)",
              fontWeight: 700,
            }}
          >
            Ausdauer, elektronische Musik und echte Momente zwischen Training,
            Events und frei bewegten Gedanken.
          </div>
        </div>

        <div
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid rgba(17,18,23,0.14)",
            paddingTop: "28px",
            fontSize: "18px",
            fontWeight: 850,
            color: "rgba(17,18,23,0.58)",
            letterSpacing: "0.16em",
            textTransform: "uppercase",
          }}
        >
          <div style={{ display: "flex" }}>www.threshold-peaks.de</div>

          <div style={{ display: "flex", gap: "26px" }}>
            <span>Running</span>
            <span>Music</span>
            <span>Journal</span>
            <span>Events</span>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
