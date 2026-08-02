import { ImageResponse } from "next/og";

export const alt =
  "Aayu Pratap Singh — engineer and founder working across software, machine learning, simulation, and visual craft.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          display: "flex",
          width: "100%",
          height: "100%",
          overflow: "hidden",
          background: "#050607",
          color: "#ecebe6",
          padding: "58px 64px",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -180,
            right: -110,
            display: "flex",
            width: 650,
            height: 650,
            border: "1px solid rgba(183, 205, 252, 0.28)",
            borderRadius: "50%",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 25,
            right: 95,
            display: "flex",
            width: 400,
            height: 520,
            borderLeft: "1px solid rgba(236, 235, 230, 0.18)",
            borderRight: "1px solid rgba(236, 235, 230, 0.18)",
            transform: "rotate(16deg)",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: 56,
            bottom: 58,
            display: "flex",
            width: 420,
            height: 2,
            background: "#4d78de",
            transform: "rotate(-24deg)",
            transformOrigin: "right center",
          }}
        />

        <div
          style={{
            zIndex: 1,
            display: "flex",
            alignItems: "center",
            gap: 18,
            fontFamily: "Arial, sans-serif",
            fontSize: 18,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
          }}
        >
          <div
            style={{
              display: "flex",
              width: 46,
              height: 46,
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid rgba(236, 235, 230, 0.55)",
              borderRadius: "50%",
              fontFamily: "Georgia, serif",
              fontSize: 15,
              letterSpacing: "-0.02em",
            }}
          >
            AP
          </div>
          Aayu Pratap Singh
        </div>

        <div
          style={{
            zIndex: 1,
            display: "flex",
            maxWidth: 810,
            flexDirection: "column",
            gap: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              color: "#a5a7a4",
              fontFamily: "Arial, sans-serif",
              fontSize: 17,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
            }}
          >
            Engineer · Founder · Visual craft
          </div>
          <div
            style={{
              display: "flex",
              fontFamily: "Georgia, serif",
              fontSize: 92,
              lineHeight: 0.95,
              letterSpacing: "-0.055em",
            }}
          >
            The work behind the moment.
          </div>
        </div>

        <div
          style={{
            zIndex: 1,
            display: "flex",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(236, 235, 230, 0.2)",
            paddingTop: 18,
            color: "#a5a7a4",
            fontFamily: "Arial, sans-serif",
            fontSize: 15,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          <span>Systems · Products · Images</span>
          <span>Waterloo, Ontario</span>
        </div>
      </div>
    ),
    size,
  );
}
