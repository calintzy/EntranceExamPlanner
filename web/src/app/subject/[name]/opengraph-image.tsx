import { ImageResponse } from "next/og";
import { courseData } from "@/lib/course-data";
import { getAllSubjects, searchBySubject } from "@/lib/course-utils";

export const alt = "과목별 권장 대학";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return getAllSubjects(courseData).map((name) => ({ name }));
}

export default async function Image({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const subjectName = decodeURIComponent(name);
  const results = searchBySubject(courseData, subjectName);
  const coreCount = results.filter((r) => r.type === "core").length;
  const recCount = results.filter((r) => r.type === "recommended").length;
  const univs = [...new Set(results.map((r) => r.university))].join(" · ");

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
          {`입시플래너 · 역방향 검색`}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: "64px",
            fontWeight: "bold",
            color: "white",
            textAlign: "center",
            marginBottom: "24px",
          }}
        >
          {subjectName}
        </div>
        <div style={{ display: "flex", gap: "24px", marginBottom: "32px" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "12px 28px",
              borderRadius: "12px",
              border: "1px solid #334155",
            }}
          >
            <div style={{ display: "flex", fontSize: "36px", fontWeight: "bold", color: "white" }}>
              {`${results.length}`}
            </div>
            <div style={{ display: "flex", fontSize: "16px", color: "#94a3b8" }}>
              {`전체 학과`}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "12px 28px",
              borderRadius: "12px",
              border: "1px solid #7f1d1d",
              background: "rgba(127, 29, 29, 0.2)",
            }}
          >
            <div style={{ display: "flex", fontSize: "36px", fontWeight: "bold", color: "#fca5a5" }}>
              {`${coreCount}`}
            </div>
            <div style={{ display: "flex", fontSize: "16px", color: "#fca5a5" }}>
              {`핵심권장`}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "12px 28px",
              borderRadius: "12px",
              border: "1px solid #1e3a5f",
              background: "rgba(30, 58, 95, 0.3)",
            }}
          >
            <div style={{ display: "flex", fontSize: "36px", fontWeight: "bold", color: "#93c5fd" }}>
              {`${recCount}`}
            </div>
            <div style={{ display: "flex", fontSize: "16px", color: "#93c5fd" }}>
              {`권장`}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", fontSize: "18px", color: "#cbd5e1" }}>
          {univs}
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
