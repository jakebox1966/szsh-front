import { ImageResponse } from "next/og";

// 브랜드 인디고→바이올렛 그라데이션 파비콘. Next.js 가 빌드 시 PNG 로 생성.
export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)",
          color: "white",
          fontSize: 23,
          fontWeight: 800,
          letterSpacing: "-1.5px",
          borderRadius: 14,
        }}
      >
        szsh
      </div>
    ),
    { ...size },
  );
}
