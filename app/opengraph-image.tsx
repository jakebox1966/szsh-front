import { ImageResponse } from "next/og";

// Next.js 정적 메타데이터 — 모든 페이지의 OG 이미지로 자동 주입됨.
// 페이지별 동적 OG 필요해지면 동일 컨벤션으로 각 디렉토리에 만들면 그쪽이 우선.

export const alt = "szsh.kr — 세전세후 AI-Powered Insights";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Pretendard (한글) 을 ImageResponse 가 렌더할 수 있도록 직접 fetch.
// jsdelivr 가 OTF 직접 서빙 — Satori 호환.
async function loadPretendard(weight: "Regular" | "Bold"): Promise<ArrayBuffer> {
  const url = `https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/packages/pretendard/dist/public/static/Pretendard-${weight}.otf`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`font load failed: ${res.status}`);
  return res.arrayBuffer();
}

export default async function Image() {
  const [regular, bold] = await Promise.all([
    loadPretendard("Regular"),
    loadPretendard("Bold"),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          background:
            "linear-gradient(135deg, #ffffff 0%, #f0f4ff 60%, #e0e7ff 100%)",
          fontFamily: "Pretendard",
          color: "#1a1a1a",
          position: "relative",
        }}
      >
        {/* 우상단 장식 — 옅은 블루 원형 */}
        <div
          style={{
            position: "absolute",
            top: "-160px",
            right: "-160px",
            width: "520px",
            height: "520px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle at 35% 35%, rgba(99,102,241,0.18), rgba(99,102,241,0))",
            display: "flex",
          }}
        />

        {/* 상단 워드마크 */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "16px",
              background: "linear-gradient(135deg, #6366f1, #4f46e5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "30px",
              fontWeight: 700,
              letterSpacing: "-0.04em",
            }}
          >
            S
          </div>
          <div
            style={{
              fontSize: "36px",
              fontWeight: 700,
              color: "#4f46e5",
              letterSpacing: "-0.03em",
            }}
          >
            szsh.kr
          </div>
        </div>

        {/* 가운데 헤드라인 */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div
            style={{
              fontSize: "92px",
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: "-0.04em",
              color: "#0f172a",
            }}
          >
            세전세후 인사이트
          </div>
          <div
            style={{
              fontSize: "36px",
              fontWeight: 400,
              lineHeight: 1.4,
              color: "#475569",
              letterSpacing: "-0.02em",
            }}
          >
            기업정보 · 연봉 · 실수령액 · 계산기
          </div>
        </div>

        {/* 하단 풋터 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            color: "#64748b",
            fontSize: "22px",
            fontWeight: 400,
          }}
        >
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <Tag>DART 공시</Tag>
            <Tag>국민연금</Tag>
            <Tag>AI 분석</Tag>
          </div>
          <div style={{ color: "#4f46e5", fontWeight: 700, fontSize: "26px" }}>
            szsh.kr
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Pretendard", data: regular, style: "normal", weight: 400 },
        { name: "Pretendard", data: bold, style: "normal", weight: 700 },
      ],
    },
  );
}

function Tag({ children }: { children: string }) {
  return (
    <div
      style={{
        display: "flex",
        padding: "8px 16px",
        background: "white",
        border: "1px solid #e2e8f0",
        borderRadius: "9999px",
        fontSize: "22px",
        color: "#475569",
      }}
    >
      {children}
    </div>
  );
}
