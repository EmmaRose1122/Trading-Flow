import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "CoreChain — Bitget execution and BEP20 settlement";
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
          color: "#2B0B0E",
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
            CC
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 34, fontWeight: 800, letterSpacing: -1 }}>
              CoreChain
            </span>
            <span style={{ fontSize: 18, color: "#6B1D1D", marginTop: 6 }}>
              Bitget execution · BEP20 settlement
            </span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", maxWidth: 920 }}>
          <span style={{ fontSize: 64, fontWeight: 800, lineHeight: 1.08, letterSpacing: -2 }}>
            A clearer view of your investment journey.
          </span>
          <span style={{ fontSize: 24, color: "#3F1414", marginTop: 24, lineHeight: 1.4 }}>
            Exchange execution · On-chain settlement · Transaction-ledger visibility
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14, color: "#FCA5A5", fontSize: 20 }}>
          <span style={{ width: 10, height: 10, borderRadius: 999, background: "#DC2626" }} />
          Capital at risk. Not a regulated financial product.
        </div>
      </div>
    ),
    size
  );
}
