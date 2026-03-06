import { ImageResponse } from "next/og";

export const runtime = "edge";
// OG 이미지는 edge runtime에서 실행되므로 courseData import 불가
// 대신 상수로 직접 관리
const OG_BRAND_NAME = "입시연구소";
const OG_UNIVERSITY_COUNT = 57;

export const alt = `${OG_BRAND_NAME} - ${OG_UNIVERSITY_COUNT}개 대학 권장과목 비교 & 역방향 검색`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1e293b 0%, #0f172a 50%, #1e3a5f 100%)",
          padding: "60px",
        }}
      >
        <div style={{ display: "flex", fontSize: "28px", color: "#94a3b8", marginBottom: "32px" }}>
          {`${OG_BRAND_NAME} · ${OG_UNIVERSITY_COUNT}개 대학`}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: "52px",
            fontWeight: "bold",
            color: "white",
            textAlign: "center",
            lineHeight: 1.3,
            marginBottom: "8px",
          }}
        >
          {`대학별 권장과목 비교 &`}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: "52px",
            fontWeight: "bold",
            color: "#60a5fa",
            textAlign: "center",
            lineHeight: 1.3,
            marginBottom: "32px",
          }}
        >
          {`역방향 검색`}
        </div>
        <div
          style={{
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {["서울대", "연세대", "고려대", "한양대", "성균관대", "경희대", "부산대", "경북대"].map((name) => (
            <div
              key={name}
              style={{
                display: "flex",
                padding: "8px 20px",
                borderRadius: "9999px",
                border: "1px solid #334155",
                color: "#cbd5e1",
                fontSize: "18px",
              }}
            >
              {name}
            </div>
          ))}
        </div>
        <div
          style={{
            display: "flex",
            position: "absolute",
            bottom: "30px",
            right: "40px",
            fontSize: "16px",
            color: "#64748b",
          }}
        >
          {`2026·2028학년도 기준`}
        </div>
      </div>
    ),
    { ...size }
  );
}
