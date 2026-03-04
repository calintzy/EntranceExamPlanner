import { ImageResponse } from "next/og";
import { courseData } from "@/lib/course-data";
import {
  getUniversityList,
  getDepartments,
  getCourseRecommendation,
} from "@/lib/course-utils";

export const alt = "학과 권장과목";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  const params: { name: string; dept: string }[] = [];
  for (const name of getUniversityList(courseData)) {
    for (const dept of getDepartments(courseData, name)) {
      params.push({ name, dept });
    }
  }
  return params;
}

export default async function Image({
  params,
}: {
  params: Promise<{ name: string; dept: string }>;
}) {
  const { name, dept } = await params;
  const univName = decodeURIComponent(name);
  const deptName = decodeURIComponent(dept);
  const rec = getCourseRecommendation(courseData, univName, deptName);

  const coreText = rec && rec.core.length > 0 ? rec.core.join(", ") : "없음";
  const recText = rec && rec.recommended.length > 0 ? rec.recommended.join(", ") : "없음";

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
        <div style={{ display: "flex", fontSize: "24px", color: "#94a3b8", marginBottom: "16px" }}>
          {`입시플래너`}
        </div>
        <div style={{ display: "flex", fontSize: "36px", color: "#60a5fa", marginBottom: "8px" }}>
          {univName}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: "52px",
            fontWeight: "bold",
            color: "white",
            textAlign: "center",
            marginBottom: "40px",
          }}
        >
          {deptName}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", width: "100%", maxWidth: "800px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                display: "flex",
                padding: "4px 12px",
                borderRadius: "6px",
                background: "#7f1d1d",
                color: "#fca5a5",
                fontSize: "16px",
              }}
            >
              {`핵심권장`}
            </div>
            <div style={{ display: "flex", fontSize: "20px", color: "#e2e8f0" }}>
              {coreText}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                display: "flex",
                padding: "4px 12px",
                borderRadius: "6px",
                background: "#1e3a5f",
                color: "#93c5fd",
                fontSize: "16px",
              }}
            >
              {`권장`}
            </div>
            <div style={{ display: "flex", fontSize: "20px", color: "#e2e8f0" }}>
              {recText}
            </div>
          </div>
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
