import { ImageResponse } from "next/og";

// Apple 터치 아이콘 (홈 화면 추가). 메인 파비콘과 동일 톤.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)",
          color: "white",
          fontSize: 62,
          fontWeight: 800,
          letterSpacing: "-3px",
        }}
      >
        szsh
      </div>
    ),
    { ...size },
  );
}
