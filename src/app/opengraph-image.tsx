import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Trading Flow Capital — UK investment dashboard";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background: "linear-gradient(135deg, #FFFFFF 0%, #FFF1F2 60%, #FFE4E6 100%)",
          color: "#F8FAFC",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 72,
              height: 72,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 18,
              background: "linear-gradient(135deg, #DC2626, #E11D48)",
              color: "#04110D",
              fontSize: 38,
              fontWeight: 800,
            }}
          >
            TF
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 34, fontWeight: 800, letterSpacing: -1 }}>
              Trading Flow Capital
            </span>
            <span style={{ fontSize: 18, color: "#94A3B8", marginTop: 6 }}>
              United Kingdom · Investor dashboard
            </span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", maxWidth: 920 }}>
          <span style={{ fontSize: 64, fontWeight: 800, lineHeight: 1.08, letterSpacing: -2 }}>
            A clearer view of your investment journey.
          </span>
          <span style={{ fontSize: 24, color: "#CBD5E1", marginTop: 24, lineHeight: 1.4 }}>
            Transparent plans · Daily profit reporting · Transaction-ledger visibility
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14, color: "#6EE7B7", fontSize: 20 }}>
          <span style={{ width: 10, height: 10, borderRadius: 999, background: "#DC2626" }} />
          Capital at risk. Demonstration platform.
        </div>
      </div>
    ),
    size
  );
}
